import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../types";
import { Group } from "../models/Group.model";
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

    if (
      group.interestedProjects.length >= 4 ||
      group.interestedProjects.includes(new Types.ObjectId(projectId))
    ) {
      res.status(400).json({ success: false, message: "Cannot add project" });
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
