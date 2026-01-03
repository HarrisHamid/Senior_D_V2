import { z } from "zod";

export const createCourseSchema = z.object({
  body: z
    .object({
      program: z.string().min(1).max(100),
      courseNumber: z.string().min(1).max(20),
      courseSection: z.string().min(1).max(5),
      season: z.enum(["Fall", "Spring", "Summer", "Winter"]),
      year: z.number().int().min(2020).max(2100),
      minGroupSize: z.number().int().min(1).max(20),
      maxGroupSize: z.number().int().min(1).max(20),
    })
    .refine((data) => data.maxGroupSize >= data.minGroupSize, {
      message: "Maximum group size must be >= minimum group size",
      path: ["maxGroupSize"],
    }),
});

export const joinCourseSchema = z.object({
  body: z.object({
    courseCode: z.string().length(7).toUpperCase(),
  }),
});

export const courseIdSchema = z.object({
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format"),
  }),
});

export const courseSchemas = {
  create: createCourseSchema,
  join: joinCourseSchema,
  courseId: courseIdSchema,
};
