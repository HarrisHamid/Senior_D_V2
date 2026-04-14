import { Response } from "express";
import { Types } from "mongoose";
import { AuthRequest } from "../types";
import { Project } from "../models/Project.model";
import { Group } from "../models/Group.model";
import Course from "../models/Course.model";

/**
 * Create a new project (Course Coordinator only)
 * POST /api/projects
 */
export const createProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const {
      courseId,
      name,
      description,
      advisors,
      sponsor,
      contacts,
      majors,
      year,
      internal,
    } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ success: false, error: "Course not found" });
      return;
    }

    // Verify the coordinator owns this course
    if (course.userId !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only create projects for your own courses",
      });
      return;
    }

    const project = await Project.create({
      courseId,
      userId: user._id,
      name,
      description,
      advisors,
      sponsor,
      contacts,
      majors,
      year,
      internal,
      assignedGroup: null,
      isOpen: true,
    });

    res.status(201).json({
      success: true,
      data: { project },
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Create project error:", error);
    res.status(500).json({ success: false, error: "Failed to create project" });
  }
};

/**
 * Get all projects for a course with optional filters
 * GET /api/projects/course/:courseId
 *
 * Query params: search, major, status (open/closed), project_type (internal/external), year, group
 */
export const getProjectsByCourse = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { courseId } = req.params;

    // Build filter object
    const filter: Record<string, unknown> = { courseId };

    const query = req.query;

    // Text search across name, description, sponsor
    if (query.search && typeof query.search === "string") {
      const escaped = query.search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const regex = new RegExp(escaped, "i");
      filter.$or = [
        { name: regex },
        { description: regex },
        { sponsor: regex },
      ];
    }

    // Filter by major(s)
    if (query.major) {
      if (typeof query.major === "string") {
        filter["majors.major"] = query.major;
      } else if (Array.isArray(query.major)) {
        filter["majors.major"] = { $in: query.major };
      }
    }

    // Filter by open/closed status
    if (query.status === "open") {
      filter.isOpen = true;
    } else if (query.status === "closed") {
      filter.isOpen = false;
    }

    // Filter by internal/external
    if (query.project_type === "internal") {
      filter.internal = true;
    } else if (query.project_type === "external") {
      filter.internal = false;
    }

    // Filter by year
    if (query.year && typeof query.year === "string") {
      filter.year = parseInt(query.year);
    }

    // Filter projects that have an assigned group
    if (query.group) {
      filter.assignedGroup = { $ne: null };
    }

    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 20, 100);
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Project.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      data: {
        projects,
        count: projects.length,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error("Get projects error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve projects" });
  }
};

/**
 * Get a single project by ID
 * GET /api/projects/:id
 */
export const getProjectById = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Get project error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to retrieve project" });
  }
};

/**
 * Update a project (Course Coordinator only)
 * PUT /api/projects/:id
 */
export const updateProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    // Verify ownership
    if (project.userId.toString() !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only update your own projects",
      });
      return;
    }

    const updatedProject = await Project.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      data: { project: updatedProject },
      message: "Project updated successfully",
    });
  } catch (error) {
    console.error("Update project error:", error);
    res.status(500).json({ success: false, error: "Failed to update project" });
  }
};

/**
 * Delete a project (Course Coordinator only)
 * DELETE /api/projects/:id
 */
export const deleteProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { id } = req.params;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    // Verify ownership
    if (project.userId.toString() !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only delete your own projects",
      });
      return;
    }

    // Clean up group references
    await Promise.all([
      // Clear assigned group's reference back to this project
      project.assignedGroup
        ? Group.findByIdAndUpdate(project.assignedGroup, {
            assignedProject: null,
          })
        : Promise.resolve(),
      // Remove this project from all groups' interestedProjects arrays
      Group.updateMany(
        { interestedProjects: id },
        { $pull: { interestedProjects: id } },
      ),
    ]);

    await Project.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Project deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    res.status(500).json({ success: false, error: "Failed to delete project" });
  }
};

/**
 * Assign a group to a project (Course Coordinator only)
 * POST /api/projects/:id/assign-group
 */
export const assignGroupToProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { groupId } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    // Verify ownership
    if (project.userId.toString() !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only assign groups to your own projects",
      });
      return;
    }

    if (project.assignedGroup) {
      res.status(400).json({
        success: false,
        error: "Project is already assigned to a group",
      });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, error: "Group not found" });
      return;
    }

    // Verify same course
    if (group.courseId !== project.courseId) {
      res.status(400).json({
        success: false,
        error: "Group and project must belong to the same course",
      });
      return;
    }

    if (group.assignedProject) {
      res.status(400).json({
        success: false,
        error: "Group is already assigned to a project",
      });
      return;
    }

    // Assign: update project side
    project.assignedGroup = new Types.ObjectId(String(group._id));
    project.isOpen = false;
    await project.save();

    // Assign: update group side — clear interested list and close group
    group.assignedProject = new Types.ObjectId(String(project._id));
    group.interestedProjects = [];
    group.isOpen = false;
    await group.save();

    // Remove this project from all other groups' interestedProjects
    await Group.updateMany(
      { interestedProjects: id },
      { $pull: { interestedProjects: id } },
    );

    res.status(200).json({
      success: true,
      data: { project, group },
      message: "Group assigned to project successfully",
    });
  } catch (error) {
    console.error("Assign group error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to assign group to project" });
  }
};

/**
 * Unassign a group from a project (Course Coordinator only)
 * POST /api/projects/:id/unassign-group
 */
export const unassignGroupFromProject = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { id } = req.params;
    const { groupId } = req.body;

    const project = await Project.findById(id);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    // Verify ownership
    if (project.userId.toString() !== user._id) {
      res.status(403).json({
        success: false,
        error: "You can only unassign groups from your own projects",
      });
      return;
    }

    const group = await Group.findById(groupId);
    if (!group) {
      res.status(404).json({ success: false, error: "Group not found" });
      return;
    }

    // Unassign both sides and reopen
    project.assignedGroup = null;
    project.isOpen = true;
    await project.save();

    group.assignedProject = null;
    group.isOpen = true;
    await group.save();

    res.status(200).json({
      success: true,
      data: { project, group },
      message: "Group unassigned from project successfully",
    });
  } catch (error) {
    console.error("Unassign group error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to unassign group from project",
    });
  }
};
