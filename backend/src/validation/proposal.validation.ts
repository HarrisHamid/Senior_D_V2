import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const baseProposalBody = {
  fullName: z.string().trim().min(1, "Full name is required").max(120),
  email: z.string().trim().email("Please provide a valid email").max(160),
  department: z.string().trim().min(1, "Department is required").max(120),
  title: z.string().trim().min(1, "Project title is required").max(200),
  description: z
    .string()
    .trim()
    .min(100, "Project description must be at least 100 characters")
    .max(8000),
};

export const createStudentProposalSchema = z.object({
  body: z.object({
    ...baseProposalBody,
    problemStatement: z
      .string()
      .trim()
      .min(1, "Problem statement is required")
      .max(4000),
    desiredSkills: z
      .string()
      .trim()
      .min(1, "Desired skills are required")
      .max(4000),
    preferredFacultyAdvisor: z
      .string()
      .trim()
      .max(160)
      .optional()
      .or(z.literal("")),
  }),
});

export const createFacultyProposalSchema = z.object({
  body: z.object({
    ...baseProposalBody,
    industryPartner: z.string().trim().max(200).optional().or(z.literal("")),
    requiredSkills: z
      .string()
      .trim()
      .min(1, "Required skills are required")
      .max(4000),
    expectedDeliverables: z
      .string()
      .trim()
      .min(1, "Expected deliverables are required")
      .max(4000),
    availableResources: z
      .string()
      .trim()
      .max(4000)
      .optional()
      .or(z.literal("")),
  }),
});

export const listProposalsSchema = z.object({
  query: z
    .object({
      role: z.enum(["student", "faculty"]).optional(),
      status: z
        .enum([
          "Pending Review",
          "Under Review",
          "Approved",
          "Rejected",
          "Matched",
        ])
        .optional(),
      department: z.string().optional(),
      startDate: z.string().optional(),
      endDate: z.string().optional(),
      search: z.string().optional(),
      page: z.string().regex(/^\d+$/).optional(),
      limit: z.string().regex(/^\d+$/).optional(),
    })
    .optional(),
});

export const proposalIdParamSchema = z.object({
  params: z.object({
    id: z.string().regex(objectIdRegex, "Invalid proposal ID format"),
  }),
});

export const updateProposalSchema = proposalIdParamSchema.extend({
  body: z.object({
    status: z
      .enum([
        "Pending Review",
        "Under Review",
        "Approved",
        "Rejected",
        "Matched",
      ])
      .optional(),
    internalNotes: z.string().max(5000).optional(),
  }),
});

export const matchProposalSchema = proposalIdParamSchema.extend({
  body: z.object({
    matchedProposalId: z
      .string()
      .regex(objectIdRegex, "Invalid matched proposal ID format"),
  }),
});

export const convertProposalSchema = proposalIdParamSchema.extend({
  body: z.object({
    courseId: z.string().regex(objectIdRegex, "Invalid course ID format"),
    year: z.number().int().min(2020).max(2100).optional(),
  }),
});

export const proposalSchemas = {
  createStudent: createStudentProposalSchema,
  createFaculty: createFacultyProposalSchema,
  list: listProposalsSchema,
  proposalId: proposalIdParamSchema,
  update: updateProposalSchema,
  match: matchProposalSchema,
  convert: convertProposalSchema,
};
