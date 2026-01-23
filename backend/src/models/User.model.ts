import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";

// Typescript Interface
// Defines what a User document looks like
export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: "Student" | "Course Coordinator";
  verificationNeeded: boolean;
  course?: string;
  groupId?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>; // Method to compare passwords
}

// Mogoose Schema
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please provide a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["Student", "Course Coordinator"],
        message: "Role must be either Student or Course Coordinator",
      },
    },
    verificationNeeded: {
      type: Boolean,
      default: false,
    },
    course: {
      type: String,
      ref: "Course",
      default: null,
      index: true,
    },
    groupId: {
      type: String,
      ref: "Group",
      default: null,
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

// Mongoose Middleware hook to hash password before saving
UserSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Method to uses the bcrypt library to safely check if
// the password the user typed in the login box matches
// the scrambled version in the database
UserSchema.methods.comparePassword = async function (
  candidatePassword: string,
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>("User", UserSchema);
