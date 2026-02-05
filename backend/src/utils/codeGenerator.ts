import { Model } from "mongoose";
import Course from "../models/Course.model";

//Generate random alphanumeric code of specified length
export const generateCode = (length: number): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () =>
    characters.charAt(Math.floor(Math.random() * characters.length)),
  ).join("");
};

// Generate unique 7-character course code
export const generateUniqueCourseCode = async (): Promise<string> => {
  while (true) {
    const code = generateCode(7);
    const existing = await Course.findOne({ courseCode: code });
    if (!existing) {
      return code;
    }
  }
};

// Generate unique 10-character group code
export const generateUniqueGroupCode = async (
  GroupModel: Model<{ groupCode: string }>,
): Promise<string> => {
  while (true) {
    const code = generateCode(10);
    const existing = await GroupModel.findOne({ groupCode: code });
    if (!existing) {
      return code;
    }
  }
};


