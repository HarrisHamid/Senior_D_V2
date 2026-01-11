import { Router } from "express";
import courseRoutes from "./course.routes";
// Import other routes as you create them

const router = Router();

router.use("/courses", courseRoutes);
// Add other routes here


export default router;
