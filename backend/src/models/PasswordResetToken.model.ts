import mongoose, { Document, Schema } from "mongoose";

export interface IPasswordResetToken extends Document {
  userId: mongoose.Types.ObjectId;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    tokenHash: {
      type: String,
      required: true,
      select: false,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// MongoDB TTL — auto-deletes expired tokens
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
// One active reset token per user at a time
PasswordResetTokenSchema.index({ userId: 1 }, { unique: true });

export default mongoose.model<IPasswordResetToken>(
  "PasswordResetToken",
  PasswordResetTokenSchema,
);
