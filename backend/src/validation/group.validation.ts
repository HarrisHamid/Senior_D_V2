import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

export const createGroupSchema = z.object({
  body: z.object({
    isPublic: z.boolean().optional().default(true),
    name: z
      .string()
      .max(50, "Group name must be 50 characters or less")
      .optional(),
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

export const respondJoinRequestSchema = z.object({
  params: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
    requestId: z.string().regex(objectIdRegex, "Invalid request ID format"),
  }),
  body: z.object({
    status: z.enum(["approved", "rejected"]),
  }),
});

export const removeMemberSchema = z.object({
  params: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
    memberId: z.string().regex(objectIdRegex, "Invalid member ID format"),
  }),
});

export const promoteLeaderSchema = z.object({
  params: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
  }),
  body: z.object({
    memberId: z.string().regex(objectIdRegex, "Invalid member ID format"),
  }),
});

export const updateGroupNameSchema = z.object({
  params: z.object({
    groupId: z.string().regex(objectIdRegex, "Invalid group ID format"),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, "Group name cannot be empty")
      .max(50, "Group name must be 50 characters or less"),
  }),
});

export const groupSchemas = {
  create: createGroupSchema,
  join: joinGroupSchema,
  groupId: groupIdParamSchema,
  courseId: courseIdParamSchema,
  projectId: projectIdParamSchema,
  interestedProject: interestedProjectSchema,
  respondJoinRequest: respondJoinRequestSchema,
  removeMember: removeMemberSchema,
  promoteLeader: promoteLeaderSchema,
  updateGroupName: updateGroupNameSchema,
};
