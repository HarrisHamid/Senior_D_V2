import { z } from "zod";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;

const uploadFileSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
});

const listFilesSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex, "Invalid project ID format"),
  }),
});

const fileParamsSchema = z.object({
  params: z.object({
    projectId: z.string().regex(objectIdRegex, "Invalid project ID format"),
    fileId: z.string().regex(objectIdRegex, "Invalid file ID format"),
  }),
});

export const uploadSchemas = {
  uploadFile: uploadFileSchema,
  listFiles: listFilesSchema,
  fileParams: fileParamsSchema,
};
