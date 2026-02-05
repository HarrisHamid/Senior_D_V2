import { Schema, Document, model, Types } from "mongoose";

// Typescript Interface
export interface IGroup extends Document {
  groupNumber: number;
  courseId: string;
  groupMembers: Types.ObjectId[];
  groupCode?: string; // Optional - reach goal: auto-generate for invite links
  isOpen: boolean;
  interestedProjects: Types.ObjectId[];
  assignedProject: Types.ObjectId | null;
}

// Mongoose Schema
const GroupSchema = new Schema<IGroup>(
  {
    groupNumber: {
      type: Number,
      required: [true, "Group number is required"],
    },
    courseId: {
      type: String,
      required: [true, "Course ID is required"],
      index: true, // adding index since you query by courseId
    },
    groupMembers: {
      type: [{ type: Schema.Types.ObjectId, ref: "User" }],
      default: [],
    },
    groupCode: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple nulls while enforcing uniqueness for non-null values
      index: true,
    },
    isOpen: {
      type: Boolean,
      default: true,
    },
    interestedProjects: {
      type: [{ type: Schema.Types.ObjectId, ref: "Project" }],
      default: [],
      validate: {
        validator: function (projects: Types.ObjectId[]) {
          return projects.length <= 4;
        },
        message: "Cannot have more than 4 interested projects",
      },
    },
    assignedProject: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt fields
  },
);

// Export Model
export const Group = model<IGroup>("Group", GroupSchema);
