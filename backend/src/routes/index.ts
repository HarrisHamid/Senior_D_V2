import { Router } from "express";
import courseRoutes from "./course.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";
import projectRoutes from "./project.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);

export default router;
