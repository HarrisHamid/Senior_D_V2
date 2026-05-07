import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../types";
import { Group } from "../models/Group.model";
import { Project } from "../models/Project.model";
import User from "../models/User.model";
import { generateUniqueGroupCode } from "../utils/codeGenerator";
import { nextSequence } from "../models/Counter.model";
import {
  sendGroupInterestEmail,
  sendGroupInterestRejectedEmail,
  sendJoinRequestEmail,
  sendJoinRequestResponseEmail,
} from "../services/email.service";

// Create new group
export const createNewGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    if (user.groupId) {
      res.status(409).json({
        success: false,
        message:
          "You already belong to a group. Leave it before creating a new one.",
      });
      return;
    }

    const { isPublic = true, name } = req.body;

    const groupCode = await generateUniqueGroupCode(
      Group as unknown as import("mongoose").Model<{ groupCode: string }>,
    );

    const groupNumber = await nextSequence("groupNumber");

    // Use provided name or auto-generate so every group has a stored name
    const effectiveName = name?.trim() || `Group ${groupNumber}`;
    const escapedName = effectiveName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    const namedConflict = await Group.findOne({
      name: { $regex: `^${escapedName}$`, $options: "i" },
    });

    const autoMatch = effectiveName.match(/^Group (\d+)$/i);
    const autoConflict = autoMatch
      ? await Group.findOne({
          $or: [{ name: { $exists: false } }, { name: null }],
          groupNumber: parseInt(autoMatch[1]),
        })
      : null;

    if (namedConflict || autoConflict) {
      res.status(409).json({
        success: false,
        message: "A group with that name already exists",
      });
      return;
    }

    const newGroup = await Group.create({
      groupNumber,
      name: effectiveName,
      groupMembers: [new Types.ObjectId(user._id)],
      groupCode,
      isOpen: true,
      isPublic,
      joinRequests: [],
      interestedProjects: [],
      assignedProject: null,
    });

    // Sync user's groupId
    await User.findByIdAndUpdate(user._id, {
      groupId: newGroup._id.toString(),
    });

    res.status(201).json({
      success: true,
      data: newGroup,
      message: "Group created successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create group",
      error: (error as Error).message,
    });
  }
};

// Join group (by code) — direct join for public, join request for private
export const joinGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const { groupCode } = req.body;
    if (!groupCode) {
      res.status(400).json({ success: false, message: "Group code required" });
      return;
    }

    const group = await Group.findOne({ groupCode });
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    if (!group.isOpen) {
      res.status(400).json({ success: false, message: "Group is closed" });
      return;
    }

    if (group.groupMembers.some((id) => id.toString() === user._id)) {
      res.status(400).json({ success: false, message: "Already in group" });
      return;
    }

    // Public group — direct join
    const isPublic = group.isPublic !== false;
    if (isPublic) {
      group.groupMembers.push(new Types.ObjectId(user._id));

      await group.save();

      await User.findByIdAndUpdate(user._id, {
        groupId: group._id.toString(),
      });

      res.status(200).json({
        success: true,
        message: "Joined group successfully",
        data: group,
      });
      return;
    }

    // Private group — create a join request
    const alreadyRequested = group.joinRequests.some(
      (r) => r.userId.toString() === user._id && r.status === "pending",
    );
    if (alreadyRequested) {
      res.status(400).json({
        success: false,
        message: "You already have a pending request for this group",
      });
      return;
    }

    const pendingCount = await Group.countDocuments({
      joinRequests: {
        $elemMatch: { userId: new Types.ObjectId(user._id), status: "pending" },
      },
    });
    if (pendingCount >= 5) {
      res.status(429).json({
        success: false,
        message:
          "You have too many pending join requests. Wait for responses before requesting more.",
      });
      return;
    }

    group.joinRequests.push({
      userId: new Types.ObjectId(user._id),
      status: "pending",
      requestedAt: new Date(),
    } as never);
    await group.save();

    // Fire-and-forget: notify group leader
    const leaderId = group.groupMembers[0];
    if (leaderId) {
      User.findById(leaderId)
        .select("name email")
        .then((leader) => {
          if (!leader) return;
          return sendJoinRequestEmail(
            leader.email,
            leader.name,
            user.name,
            group.groupNumber,
          );
        })
        .catch(console.error);
    }

    res.status(202).json({
      success: true,
      message: "Join request sent. The group leader will review your request.",
      requestPending: true,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to join group",
      error: (error as Error).message,
    });
  }
};

// Respond to a join request (approve or reject) — group leader only
export const respondToJoinRequest = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId, requestId } = req.params;
    const { status } = req.body as { status: "approved" | "rejected" };

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Only the group leader (first member / creator) can respond
    const leaderId = group.groupMembers[0];
    if (!leaderId || leaderId.toString() !== user._id) {
      res.status(403).json({
        success: false,
        message: "Only the group leader can approve or reject requests",
      });
      return;
    }

    const joinRequest = group.joinRequests.id(requestId);
    if (!joinRequest || joinRequest.status !== "pending") {
      res
        .status(404)
        .json({ success: false, message: "Pending request not found" });
      return;
    }

    const requestUserId = joinRequest.userId;

    if (status === "approved") {
      // Check group is still open
      if (!group.isOpen) {
        res
          .status(400)
          .json({ success: false, message: "Group is no longer open" });
        return;
      }

      group.groupMembers.push(new Types.ObjectId(requestUserId));

      // Sync user's groupId
      await User.findByIdAndUpdate(requestUserId, {
        groupId: groupId,
      });
    }

    // Remove the request regardless of outcome
    group.joinRequests.pull(requestId);
    await group.save();

    // Fire-and-forget: notify the requester of the outcome
    User.findById(requestUserId)
      .select("name email")
      .then((requester) => {
        if (!requester) return;
        return sendJoinRequestResponseEmail(
          requester.email,
          requester.name,
          group.groupNumber,
          status === "approved",
        );
      })
      .catch(console.error);

    const populated = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      message:
        status === "approved"
          ? "Request approved. Student added to group."
          : "Request rejected.",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to respond to join request",
      error: (error as Error).message,
    });
  }
};

// Leave group
export const leaveGroup = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;

    if (!user || !Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ success: false, message: "Invalid request" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const wasLeader = group.groupMembers[0]?.toString() === user._id;

    group.groupMembers = group.groupMembers.filter(
      (id) => id.toString() !== user._id,
    );

    // Clear user's groupId
    await User.findByIdAndUpdate(user._id, { groupId: null });

    if (group.groupMembers.length === 0) {
      await Group.findByIdAndDelete(groupId);
      res.status(200).json({
        success: true,
        message: "Group deleted (no members left)",
      });
      return;
    }

    await group.save();

    let newLeader: { _id: string; name: string } | undefined;
    if (wasLeader) {
      const newLeaderDoc = await User.findById(group.groupMembers[0]).select(
        "name",
      );
      if (newLeaderDoc) {
        newLeader = {
          _id: newLeaderDoc._id.toString(),
          name: newLeaderDoc.name,
        };
      }
    }

    res.status(200).json({
      success: true,
      message: "Left group successfully",
      data: group,
      leadershipTransferred: wasLeader,
      newLeader,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to leave group",
      error: (error as Error).message,
    });
  }
};

// Remove a member from the group (leader only)
export const removeMember = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId, memberId } = req.params;

    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Only the group leader (first member) can remove others
    if (group.groupMembers[0]?.toString() !== user._id) {
      res.status(403).json({
        success: false,
        message: "Only the group leader can remove members",
      });
      return;
    }

    // Leader cannot remove themselves via this endpoint
    if (memberId === user._id) {
      res.status(400).json({
        success: false,
        message: "Use leave group to remove yourself",
      });
      return;
    }

    const memberExists = group.groupMembers.some(
      (id) => id.toString() === memberId,
    );
    if (!memberExists) {
      res
        .status(404)
        .json({ success: false, message: "Member not found in group" });
      return;
    }

    group.groupMembers = group.groupMembers.filter(
      (id) => id.toString() !== memberId,
    );
    await group.save();

    await User.findByIdAndUpdate(memberId, { groupId: null });

    const updatedGroup = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      message: "Member removed from group",
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove member",
      error: (error as Error).message,
    });
  }
};

// Promote a member to group leader (leader only)
export const promoteLeader = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const { memberId } = req.body;

    if (!user) {
      res.status(401).json({ success: false, message: "Not authenticated" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    if (group.groupMembers[0]?.toString() !== user._id) {
      res.status(403).json({
        success: false,
        message: "Only the group leader can promote members",
      });
      return;
    }

    if (memberId === user._id) {
      res.status(400).json({
        success: false,
        message: "You are already the group leader",
      });
      return;
    }

    const promotedId = group.groupMembers.find(
      (id) => id.toString() === memberId,
    );
    if (!promotedId) {
      res
        .status(404)
        .json({ success: false, message: "Member not found in group" });
      return;
    }

    const promoted = await User.findById(memberId).select("name");

    // Move promoted member to front
    const remaining = group.groupMembers.filter(
      (id) => id.toString() !== memberId,
    );
    group.groupMembers = [
      promotedId,
      ...remaining,
    ] as typeof group.groupMembers;

    await group.save();

    const updatedGroup = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      message: `${promoted?.name ?? "Member"} is now the group leader`,
      data: updatedGroup,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to promote member",
      error: (error as Error).message,
    });
  }
};

// Get group by id
export const getGroupById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { groupId } = req.params;

    if (!Types.ObjectId.isValid(groupId)) {
      res.status(400).json({ success: false, message: "Invalid group ID" });
      return;
    }

    const group = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    if (!group.groupCode) {
      group.groupCode = await generateUniqueGroupCode(
        Group as unknown as import("mongoose").Model<{ groupCode: string }>,
      );
      await group.save();
    }

    res.status(200).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch group",
      error: (error as Error).message,
    });
  }
};

// Get all groups (global view)
export const getAllGroups = async (
  _req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const groups = await Group.find({});

    res.status(200).json({
      success: true,
      data: groups.map((g) => ({
        ...g.toObject(),
        numberOfMembers: g.groupMembers.length,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch groups",
      error: (error as Error).message,
    });
  }
};

// Toggle group open/closed status
export const toggleStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const leaderId = group.groupMembers[0];
    if (!leaderId || leaderId.toString() !== user?._id) {
      res.status(403).json({
        success: false,
        message: "Only the group leader can change group status",
      });
      return;
    }

    group.isOpen = !group.isOpen;
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      data: populated,
      message: "Group status updated",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle status",
      error: (error as Error).message,
    });
  }
};

// Toggle group public/private visibility
export const toggleVisibility = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Only the group leader can change visibility
    const leaderId = group.groupMembers[0];
    if (!leaderId || leaderId.toString() !== user?._id) {
      res.status(403).json({
        success: false,
        message: "Only the group leader can change group visibility",
      });
      return;
    }

    group.isPublic = !group.isPublic;
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      data: populated,
      message: `Group is now ${group.isPublic ? "public" : "private"}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to toggle visibility",
      error: (error as Error).message,
    });
  }
};

// Add interested project
export const addInterestedProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const { projectId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const isMember = group.groupMembers.some(
      (id) => id.toString() === user?._id,
    );
    if (!isMember) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Verify project is not already assigned to a group
    if (project.assignedGroup) {
      res.status(400).json({
        success: false,
        message: "Project is already assigned to a group",
      });
      return;
    }

    // Verify group is not already assigned to a project
    if (group.assignedProject) {
      res.status(400).json({
        success: false,
        message: "Group is already assigned to a project",
      });
      return;
    }

    // Verify group has not exceeded max-4 interest limit
    if (group.interestedProjects.length >= 4) {
      res.status(400).json({
        success: false,
        message: "Cannot add project: interest limit of 4 reached",
      });
      return;
    }

    // Prevent duplicates
    const alreadyInterested = group.interestedProjects.some(
      (id) => id.toString() === projectId,
    );
    if (alreadyInterested) {
      res.status(400).json({
        success: false,
        message: "Cannot add project: already in interested list",
      });
      return;
    }

    group.interestedProjects.push(new Types.ObjectId(projectId));
    await group.save();

    // Fire-and-forget: notify the project's coordinator that this group is interested
    User.findById(project.userId)
      .select("name email")
      .then(async (coordinator) => {
        if (!coordinator) return;
        const members = await User.find({
          _id: { $in: group.groupMembers },
        }).select("name");
        return sendGroupInterestEmail(
          coordinator.email,
          coordinator.name,
          project.name,
          group.groupNumber,
          members.map((m) => m.name),
        );
      })
      .catch(console.error);

    const populated = await Group.findById(group._id)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      message: "Project added",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add project",
      error: (error as Error).message,
    });
  }
};

// Remove interested project
export const removeInterestedProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const { projectId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const isMember = group.groupMembers.some(
      (id) => id.toString() === user?._id,
    );
    if (!isMember) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const projectExists = group.interestedProjects.some(
      (id) => id.toString() === projectId,
    );
    if (!projectExists) {
      res.status(400).json({
        success: false,
        message: "Project not found in interested list",
      });
      return;
    }

    group.interestedProjects = group.interestedProjects.filter(
      (id) => id.toString() !== projectId,
    );

    await group.save();

    const populated = await Group.findById(group._id)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      message: "Project removed",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove project",
      error: (error as Error).message,
    });
  }
};

// Coordinator rejects a group's interest in their project
export const rejectGroupInterest = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const { projectId } = req.body as { projectId: string };

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    if (project.userId.toString() !== user?._id) {
      res.status(403).json({ success: false, message: "Forbidden" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    const isInterested = group.interestedProjects.some(
      (id) => id.toString() === projectId,
    );
    if (!isInterested) {
      res.status(400).json({
        success: false,
        message: "Group has not expressed interest in this project",
      });
      return;
    }

    group.interestedProjects = group.interestedProjects.filter(
      (id) => id.toString() !== projectId,
    );
    await group.save();

    // Fire-and-forget: notify group members their interest was rejected
    User.find({ _id: { $in: group.groupMembers } })
      .select("email")
      .then((members) =>
        sendGroupInterestRejectedEmail(
          members.map((m) => m.email),
          project.name,
          user!.name,
          group.groupNumber,
        ),
      )
      .catch(console.error);

    res.status(200).json({ success: true, message: "Interest rejected" });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reject interest",
      error: (error as Error).message,
    });
  }
};

// Update group name (leader only)
export const updateGroupName = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    const { groupId } = req.params;
    const { name } = req.body as { name: string };

    if (!user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    if (group.groupMembers[0]?.toString() !== user._id) {
      res.status(403).json({
        success: false,
        message: "Only the group leader can rename the group",
      });
      return;
    }

    const existing = await Group.findOne({
      _id: { $ne: group._id },
      name: {
        $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
        $options: "i",
      },
    });
    if (existing) {
      res.status(409).json({
        success: false,
        message: "A group with that name already exists",
      });
      return;
    }

    group.name = name.trim();
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("groupMembers", "name email major")
      .populate("interestedProjects")
      .populate("assignedProject")
      .populate("joinRequests.userId", "name email major");

    res.status(200).json({
      success: true,
      message: "Group name updated",
      data: populated,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update group name",
      error: (error as Error).message,
    });
  }
};

// Get all groups interested in a project
export const getAllInterestedGroups = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { projectId } = req.params;

    const groups = await Group.find({
      interestedProjects: new Types.ObjectId(projectId),
    }).populate("groupMembers", "name email major");

    res.status(200).json({
      success: true,
      data: groups.map((g) => ({
        ...g.toObject(),
        numberOfMembers: g.groupMembers.length,
      })),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch interested groups",
      error: (error as Error).message,
    });
  }
};
