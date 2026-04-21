import { Response } from "express";
import fs from "fs";
import { AuthRequest } from "../types";
import { Project } from "../models/Project.model";
import { UploadedFile } from "../models/UploadedFile.model";
import { Types } from "mongoose";

const serializeUploadedFile = (file: {
  _id: unknown;
  originalName: string;
  filename: string;
  mimetype: string;
  size: number;
  createdAt?: Date;
}) => ({
  _id: file._id,
  originalName: file.originalName,
  filename: file.filename,
  mimetype: file.mimetype,
  size: file.size,
  createdAt: file.createdAt,
});

/**
 * Upload a file to a project
 * POST /api/uploads/:projectId
 */
export const uploadFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      // Clean up orphaned file if project not found
      if (req.file) {
        fs.unlink(req.file.path, () => {});
      }
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    if (!req.file) {
      res.status(400).json({ success: false, error: "No file provided" });
      return;
    }

    const uploadedFile = await UploadedFile.create({
      projectId: new Types.ObjectId(projectId),
      uploadedBy: new Types.ObjectId(user._id),
      originalName: req.file.originalname,
      filename: req.file.filename,
      path: req.file.path,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    const { _id, originalName, filename, mimetype, size, createdAt } =
      uploadedFile.toObject();
    res.status(201).json({
      success: true,
      data: { file: serializeUploadedFile(uploadedFile) },
      message: "File uploaded successfully",
    });
  } catch (error) {
    console.error("Upload file error:", error);
    res.status(500).json({ success: false, error: "Failed to upload file" });
  }
};

/**
 * List all files for a project
 * GET /api/uploads/:projectId
 */
export const listFiles = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      res.status(404).json({ success: false, error: "Project not found" });
      return;
    }

    const files = await UploadedFile.find({ projectId })
      .select("-path -__v")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        files: files.map(serializeUploadedFile),
        count: files.length,
      },
    });
  } catch (error) {
    console.error("List files error:", error);
    res.status(500).json({ success: false, error: "Failed to retrieve files" });
  }
};

/**
 * Download a file
 * GET /api/uploads/:projectId/:fileId
 */
export const downloadFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { projectId, fileId } = req.params;

    const file = await UploadedFile.findOne({ _id: fileId, projectId });
    if (!file) {
      res.status(404).json({ success: false, error: "File not found" });
      return;
    }

    if (!fs.existsSync(file.path)) {
      res.status(404).json({ success: false, error: "File not found on disk" });
      return;
    }

    res.download(file.path, file.originalName, (err) => {
      if (err && !res.headersSent) {
        res
          .status(500)
          .json({ success: false, error: "Failed to download file" });
      }
    });
  } catch (error) {
    console.error("Download file error:", error);
    res.status(500).json({ success: false, error: "Failed to download file" });
  }
};

/**
 * Delete a file
 * DELETE /api/uploads/:projectId/:fileId
 */
export const deleteFile = async (
  req: AuthRequest,
  res: Response,
): Promise<void> => {
  try {
    const user = req.user;
    if (!user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }

    const { projectId, fileId } = req.params;

    const file = await UploadedFile.findOne({ _id: fileId, projectId });
    if (!file) {
      res.status(404).json({ success: false, error: "File not found" });
      return;
    }

    const isUploader = file.uploadedBy.toString() === user._id;
    const isCoordinator = user.role === "course coordinator";

    let isOwningCoordinator = false;
    if (isCoordinator) {
      const project = await Project.findById(projectId);
      isOwningCoordinator = project?.userId.toString() === user._id;
    }

    if (!isUploader && !isOwningCoordinator) {
      res.status(403).json({
        success: false,
        error: "You do not have permission to delete this file",
      });
      return;
    }

    // Fire-and-forget disk cleanup
    fs.unlink(file.path, () => {});

    await UploadedFile.findByIdAndDelete(fileId);

    res.status(200).json({
      success: true,
      message: "File deleted successfully",
    });
  } catch (error) {
    console.error("Delete file error:", error);
    res.status(500).json({ success: false, error: "Failed to delete file" });
  }
};
