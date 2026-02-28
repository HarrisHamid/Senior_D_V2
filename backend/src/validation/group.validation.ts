import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createGroupSchema = z.object({
  body: z.object({
    courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
  }),
});

export const joinGroupSchema = z.object({
  body: z.object({
    groupCode: z
      .string()
      .length(10, "Group code must be exactly 10 characters"),
  }),
});

export const groupIdParamSchema = z.object({
  params: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
  }),
});

export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
  }),
});

export const projectIdParamSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
});

export const interestedProjectSchema = z.object({
  params: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
  }),
  body: z.object({
    projectId: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
});

export const groupSchemas = {
  create: createGroupSchema,
  join: joinGroupSchema,
  groupId: groupIdParamSchema,
  courseId: courseIdParamSchema,
  projectId: projectIdParamSchema,
  interestedProject: interestedProjectSchema,
};
