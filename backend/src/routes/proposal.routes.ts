import { Router } from "express";
import {
  createFacultyProposal,
  createStudentProposal,
  exportProposalsCsv,
  getProposalById,
  listProposals,
  matchProposal,
  updateProposal,
  convertProposalToProject,
} from "../controllers/proposal.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { uploadProposalAttachments } from "../middleware/proposalUpload.middleware";
import { validateRequest } from "../middleware/validation.middleware";
import { proposalSchemas } from "../validation/proposal.validation";

const router = Router();

router.post(
  "/student",
  uploadProposalAttachments,
  validateRequest(proposalSchemas.createStudent),
  createStudentProposal,
);

router.post(
  "/faculty",
  uploadProposalAttachments,
  validateRequest(proposalSchemas.createFaculty),
  createFacultyProposal,
);

router.use(authenticate, requireRole("course coordinator"));

router.get("/", validateRequest(proposalSchemas.list), listProposals);
router.get(
  "/export",
  validateRequest(proposalSchemas.list),
  exportProposalsCsv,
);
router.get(
  "/:id",
  validateRequest(proposalSchemas.proposalId),
  getProposalById,
);
router.patch("/:id", validateRequest(proposalSchemas.update), updateProposal);
router.post(
  "/:id/match",
  validateRequest(proposalSchemas.match),
  matchProposal,
);
router.post(
  "/:id/convert-to-project",
  validateRequest(proposalSchemas.convert),
  convertProposalToProject,
);

export default router;
