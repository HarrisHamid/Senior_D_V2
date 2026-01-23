import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

// Higher-Order Function that creates an Express middleware to validate
// incoming request data against a Zod schema
export const validateRequest = (schema: ZodSchema) => {
  return async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Data is valid; proceed to the next middleware or controller.
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          error: "Validation failed",
          details: error.issues.map((err) => ({
            field: err.path.join("."),
            // .path returns an array (e.g., ['body', 'email']), we join it to 'body.email'
            message: err.message,
          })),
        });
        return;
      }

      res.status(400).json({
        success: false,
        error: "Invalid request data",
      });
    }
  };
};
