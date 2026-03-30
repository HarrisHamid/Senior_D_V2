import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../types";
import { Group } from "../models/Group.model";
import { Project } from "../models/Project.model";
import { generateUniqueGroupCode } from "../utils/codeGenerator";

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

    const { courseId } = req.body;
    if (!courseId) {
      res
        .status(400)
        .json({ success: false, message: "Course ID is required" });
      return;
    }

    const groupCode = await generateUniqueGroupCode(
      Group as unknown as import("mongoose").Model<{ groupCode: string }>,
    );

    const groupNumber = (await Group.countDocuments({ courseId })) + 1;

    const newGroup = await Group.create({
      groupNumber,
      courseId,
      groupMembers: [new Types.ObjectId(user._id)],
      groupCode,
      isOpen: true,
      interestedProjects: [],
      assignedProject: null,
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

// Join group (by code)
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

    group.groupMembers.push(new Types.ObjectId(user._id));
    await group.save();

    res.status(200).json({
      success: true,
      message: "Joined group successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to join group",
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

    group.groupMembers = group.groupMembers.filter(
      (id) => id.toString() !== user._id,
    );

    if (group.groupMembers.length === 0) {
      await Group.findByIdAndDelete(groupId);
      res.status(200).json({
        success: true,
        message: "Group deleted (no members left)",
      });
      return;
    }

    await group.save();

    res.status(200).json({
      success: true,
      message: "Left group successfully",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to leave group",
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
      .populate("groupMembers", "name email")
      .populate("interestedProjects")
      .populate("assignedProject");

    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
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

// Get all groups by course
export const getAllGroupsByCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { courseId } = req.params;

    const groups = await Group.find({ courseId });

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

// Toggle group status
export const toggleStatus = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { groupId } = req.params;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    group.isOpen = !group.isOpen;
    await group.save();

    res.status(200).json({
      success: true,
      data: group.isOpen,
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

// Add interested project
export const addInterestedProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { groupId } = req.params;
    const { projectId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
      return;
    }

    // Verify the project exists
    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, message: "Project not found" });
      return;
    }

    // Verify project belongs to the same course as the group
    if (project.courseId !== group.courseId) {
      res.status(400).json({
        success: false,
        message: "Project and group must belong to the same course",
      });
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

    res.status(200).json({
      success: true,
      message: "Project added",
      data: group,
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
    const { groupId } = req.params;
    const { projectId } = req.body;

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, message: "Group not found" });
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

    res.status(200).json({
      success: true,
      message: "Project removed",
      data: group,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to remove project",
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
    });

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
