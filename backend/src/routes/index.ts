import { Router } from "express";
import courseRoutes from "./course.routes";
import authRoutes from "./auth.routes";
import userRoutes from "./user.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRoutes);
router.use("/users", userRoutes);

export default router;
