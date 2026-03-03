import mongoose, { Document, Schema } from "mongoose";

export interface IVerificationCode extends Document {
  userId: mongoose.Types.ObjectId;
  email: string;
  codeHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationCodeSchema = new Schema<IVerificationCode>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    codeHash: {
      type: String,
      required: true,
      select: false,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

VerificationCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
VerificationCodeSchema.index({ userId: 1, email: 1 }, { unique: true });

export default mongoose.model<IVerificationCode>(
  "VerificationCode",
  VerificationCodeSchema,
);
