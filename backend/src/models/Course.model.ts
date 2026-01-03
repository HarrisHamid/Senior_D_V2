import mongoose, { Schema, Document } from "mongoose";

// Typescript Interface
// Defines what a Course document looks like
export interface ICourse extends Document {
  userId: string;
  name: string;
  email: string;
  program: string;
  courseNumber: string;
  courseSection: string;
  season: "Fall" | "Spring" | "Summer" | "Winter";
  year: number;
  minGroupSize: number;
  maxGroupSize: number;
  courseCode: string;
  lastGroupNumber: number;
  closed: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Mogoose Schema
const CourseSchema = new Schema<ICourse>(
  {
    userId: {
      type: String,
      required: [true, "User ID is required"],
      ref: "User",
      index: true,
    },
    name: {
      type: String,
      required: [true, "Coordinator name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      lowercase: true,
      trim: true,
    },
    program: {
      type: String,
      required: [true, "Program is required"],
      trim: true,
      maxlength: [100, "Program name cannot exceed 100 characters"],
    },
    courseNumber: {
      type: String,
      required: [true, "Course number is required"],
      trim: true,
      maxlength: [20, "Course number cannot exceed 20 characters"],
    },
    courseSection: {
      type: String,
      required: [true, "Course section is required"],
      trim: true,
      maxlength: [5, "Section cannot exceed 5 characters"],
    },
    season: {
      type: String,
      required: [true, "Season is required"],
      enum: {
        values: ["Fall", "Spring", "Summer", "Winter"],
        message: "Season must be Fall, Spring, Summer, or Winter",
      },
    },
    year: {
      type: Number,
      required: [true, "Year is required"],
      min: [2020, "Year must be 2020 or later"],
      max: [2100, "Year must be before 2100"], // Arbitrary upper limit
    },
    minGroupSize: {
      type: Number,
      required: [true, "Minimum group size is required"],
      min: [1, "Minimum group size must be at least 1"],
      max: [10, "Minimum group size cannot exceed 10"],
    },
    maxGroupSize: {
      type: Number,
      required: [true, "Maximum group size is required"],
      min: [1, "Maximum group size must be at least 1"],
      max: [10, "Maximum group size cannot exceed 10"],
    },
    courseCode: {
      type: String,
      required: [true, "Course code is required"],
      unique: true,
      uppercase: true,
      index: true,
    },
    lastGroupNumber: {
      type: Number,
      default: 0,
      min: [0, "Last group number cannot be negative"],
    },
    closed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true, // automatically creates createdAt and updatedAt fields
  }
);

// Compound indexes
// allows db to fileter and return results faster based on these fields
CourseSchema.index({ userId: 1, closed: 1, year: -1 });

// Validate maxGroupSize >= minGroupSize
CourseSchema.pre("save", async function (this: ICourse) {
  if (this.maxGroupSize < this.minGroupSize) {
    throw new Error(
      "Maximum group size must be greater than or equal to minimum group size"
    );
  }
});

//compiles the Schema into a Model
export default mongoose.model<ICourse>("Course", CourseSchema);
