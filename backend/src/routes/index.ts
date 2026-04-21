import { Router } from "express";
import courseRoutes from "./course.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import projectRoutes from "./project.routes";
import groupRoutes from "./group.routes";
import uploadRoutes from "./upload.routes";
import proposalRoutes from "./proposal.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/groups", groupRoutes);
router.use("/uploads", uploadRoutes);
router.use("/proposals", proposalRoutes);

export default router;
