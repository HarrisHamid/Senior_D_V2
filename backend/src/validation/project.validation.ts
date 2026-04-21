import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please provide a valid email"),
});

const majorSchema = z.object({
  major: z.string().min(1, "Major is required"),
});

export const createProjectSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Project name is required").max(200),
    description: z.string().min(1, "Description is required").max(5000),
    advisors: z.array(contactSchema).optional().default([]),
    sponsor: z.string().min(1, "Sponsor is required").max(200),
    contacts: z.array(contactSchema).optional().default([]),
    majors: z.array(majorSchema).optional().default([]),
    year: z.number().int().min(2020).max(2100),
    internal: z.boolean().optional().default(false),
  }),
});

export const updateProjectSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
  body: z.object({
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(5000).optional(),
    advisors: z.array(contactSchema).optional(),
    sponsor: z.string().min(1).max(200).optional(),
    contacts: z.array(contactSchema).optional(),
    majors: z.array(majorSchema).optional(),
    year: z.number().int().min(2020).max(2100).optional(),
    internal: z.boolean().optional(),
    isOpen: z.boolean().optional(),
  }),
});

export const projectIdSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
});

export const courseIdParamSchema = z.object({
  params: z.object({
    courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
  }),
});

export const assignGroupSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
  body: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
  }),
});

export const getProjectsQuerySchema = z.object({
  params: z.object({
    courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
  }),
  query: z
    .object({
      search: z.string().optional(),
      major: z.union([z.string(), z.array(z.string())]).optional(),
      status: z.enum(["open", "closed"]).optional(),
      project_type: z.enum(["internal", "external"]).optional(),
      year: z
        .string()
        .regex(/^\d{4}$/, "Year must be a 4-digit number")
        .optional(),
      group: z.string().optional(),
      page: z
        .string()
        .regex(/^\d+$/, "Page must be a positive number")
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a positive number")
        .optional(),
    })
    .optional(),
});

export const getAllProjectsQuerySchema = z.object({
  query: z
    .object({
      search: z.string().optional(),
      major: z.union([z.string(), z.array(z.string())]).optional(),
      status: z.enum(["open", "closed"]).optional(),
      project_type: z.enum(["internal", "external"]).optional(),
      year: z
        .string()
        .regex(/^\d{4}$/, "Year must be a 4-digit number")
        .optional(),
      group: z.string().optional(),
      page: z
        .string()
        .regex(/^\d+$/, "Page must be a positive number")
        .optional(),
      limit: z
        .string()
        .regex(/^\d+$/, "Limit must be a positive number")
        .optional(),
    })
    .optional(),
});

export const projectSchemas = {
  create: createProjectSchema,
  update: updateProjectSchema,
  projectId: projectIdSchema,
  courseId: courseIdParamSchema,
  assignGroup: assignGroupSchema,
  getProjectsQuery: getProjectsQuerySchema,
  getAllProjectsQuery: getAllProjectsQuerySchema,
};
