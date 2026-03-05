import { Document, Schema, model, Types } from "mongoose";

export interface IUploadedFile extends Document {
  projectId: Types.ObjectId;
  uploadedBy: Types.ObjectId;
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

const UploadedFileSchema = new Schema<IUploadedFile>(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project ID is required"],
      index: true,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Uploader ID is required"],
    },
    originalName: {
      type: String,
      required: [true, "Original filename is required"],
    },
    filename: {
      type: String,
      required: [true, "Disk filename is required"],
    },
    path: {
      type: String,
      required: [true, "File path is required"],
    },
    mimetype: {
      type: String,
      required: [true, "MIME type is required"],
    },
    size: {
      type: Number,
      required: [true, "File size is required"],
    },
  },
  {
    timestamps: true,
  },
);

export const UploadedFile = model<IUploadedFile>(
  "UploadedFile",
  UploadedFileSchema,
);
