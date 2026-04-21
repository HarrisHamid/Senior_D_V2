import { Document, Schema, model, Types } from "mongoose";

// Typescript Interface
export interface IProject extends Document {
  courseId: string;
  userId: Types.ObjectId;
  name: string;
  description: string;
  advisors: { name: string; email: string }[];
  sponsor: string;
  contacts: { name: string; email: string }[];
  majors: { major: string }[];
  year: number;
  internal: boolean;
  assignedGroup: Types.ObjectId | null;
  isOpen: boolean;
  sourceProposal: Types.ObjectId | null;
}

// Mongoose Schema
const ProjectSchema = new Schema<IProject>(
  {
    courseId: {
      type: String,
      required: [true, "Course ID is required"],
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    name: {
      type: String,
      required: [true, "Project name is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    advisors: {
      type: [
        {
          name: String,
          email: {
            type: String,
            match: [
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              "Please provide a valid advisor email",
            ],
          },
        },
      ],
      default: [],
    },
    sponsor: {
      type: String,
      required: [true, "Sponsor is required"],
    },
    contacts: {
      type: [
        {
          name: String,
          email: {
            type: String,
            match: [
              /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              "Please provide a valid contact email",
            ],
          },
        },
      ],
      default: [],
    },
    majors: {
      type: [{ major: String }],
      default: [],
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
    },
    internal: {
      type: Boolean,
      default: false,
    },
    assignedGroup: {
      type: Schema.Types.ObjectId,
      ref: "Group",
      default: null,
      index: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
      index: true,
    },
    sourceProposal: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Export Model
export const Project = model<IProject>("Project", ProjectSchema);
