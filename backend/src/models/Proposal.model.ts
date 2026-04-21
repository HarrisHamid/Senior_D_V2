import { Document, Schema, model, Types } from "mongoose";

export type ProposalRole = "student" | "faculty";
export type ProposalStatus =
  | "Pending Review"
  | "Under Review"
  | "Approved"
  | "Rejected"
  | "Matched";

export interface IProposalAttachment {
  originalName: string;
  filename: string;
  path: string;
  mimetype: string;
  size: number;
}

export interface IProposal extends Document {
  proposalId: string;
  role: ProposalRole;
  status: ProposalStatus;
  fullName: string;
  email: string;
  department: string;
  title: string;
  description: string;
  problemStatement?: string;
  desiredSkills?: string;
  preferredFacultyAdvisor?: string;
  industryPartner?: string;
  requiredSkills?: string;
  expectedDeliverables?: string;
  availableResources?: string;
  attachments: IProposalAttachment[];
  internalNotes: string;
  matchedProposal?: Types.ObjectId | null;
  createdProject?: Types.ObjectId | null;
  createdAt: Date;
  updatedAt: Date;
}

const AttachmentSchema = new Schema<IProposalAttachment>(
  {
    originalName: { type: String, required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },
  },
  { _id: false },
);

const ProposalSchema = new Schema<IProposal>(
  {
    proposalId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      required: true,
      enum: ["student", "faculty"],
      index: true,
    },
    status: {
      type: String,
      required: true,
      enum: [
        "Pending Review",
        "Under Review",
        "Approved",
        "Rejected",
        "Matched",
      ],
      default: "Pending Review",
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    department: { type: String, required: true, trim: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    problemStatement: { type: String, trim: true },
    desiredSkills: { type: String, trim: true },
    preferredFacultyAdvisor: { type: String, trim: true },
    industryPartner: { type: String, trim: true },
    requiredSkills: { type: String, trim: true },
    expectedDeliverables: { type: String, trim: true },
    availableResources: { type: String, trim: true },
    attachments: { type: [AttachmentSchema], default: [] },
    internalNotes: { type: String, default: "", trim: true },
    matchedProposal: {
      type: Schema.Types.ObjectId,
      ref: "Proposal",
      default: null,
      index: true,
    },
    createdProject: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      default: null,
      index: true,
    },
  },
  { timestamps: true },
);

ProposalSchema.index({ role: 1, status: 1, department: 1, createdAt: -1 });
ProposalSchema.index({ title: "text", description: "text", fullName: "text" });

export const Proposal = model<IProposal>("Proposal", ProposalSchema);
