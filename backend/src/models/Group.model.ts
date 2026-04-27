import { Schema, Document, model, Types } from "mongoose";

export interface IJoinRequest {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: "pending" | "approved" | "rejected";
  requestedAt: Date;
}

// Typescript Interface
export interface IGroup extends Document {
  groupNumber: number;
  name?: string;
  courseId?: string;
  groupMembers: Types.ObjectId[];
  groupCode?: string;
  isOpen: boolean;
  isPublic: boolean;
  joinRequests: Types.DocumentArray<IJoinRequest>;
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
    name: {
      type: String,
      required: false,
      trim: true,
    },
    courseId: {
      type: String,
      required: false,
      index: true,
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
    isPublic: {
      type: Boolean,
      default: true,
    },
    joinRequests: {
      type: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
          },
          requestedAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
      default: [],
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

GroupSchema.index({ courseId: 1, name: 1 });

// Export Model
export const Group = model<IGroup>("Group", GroupSchema);
