import { Router } from "express";
import courseRoutes from "./course.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);

export default router;
