import { Router } from "express";
import {
  uploadFile,
  listFiles,
  downloadFile,
  deleteFile,
} from "../controllers/upload.controller";
import { authenticate } from "../middleware/auth.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { uploadSingle } from "../middleware/upload.middleware";
import { uploadSchemas } from "../validation/upload.validation";

const router = Router();

router.use(authenticate);

router.post(
  "/:projectId",
  validateRequest(uploadSchemas.uploadFile),
  uploadSingle,
  uploadFile,
);

router.get("/:projectId", validateRequest(uploadSchemas.listFiles), listFiles);

router.get(
  "/:projectId/:fileId",
  validateRequest(uploadSchemas.fileParams),
  downloadFile,
);

router.delete(
  "/:projectId/:fileId",
  validateRequest(uploadSchemas.fileParams),
  deleteFile,
);

export default router;
