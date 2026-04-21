import { z } from "zod";
import {
  ALL_MAJORS,
  MAJORS_BY_SCHOOL,
  SCHOOL_NAMES,
} from "../constants/schools";

const schoolSchema = z.enum(SCHOOL_NAMES as [string, ...string[]], {
  message: "Please select a valid school",
});

const majorSchema = z.enum(ALL_MAJORS as [string, ...string[]], {
  message: "Please select a valid major",
});

export const registerSchema = z.object({
  body: z
    .object({
      name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name must be 100 characters or fewer")
        .regex(
          /^[a-zA-Z\s'-]+$/,
          "Name can only contain letters, spaces, hyphens, and apostrophes",
        ),
      email: z
        .string()
        .email("Please enter a valid email address")
        .refine((val) => val.toLowerCase().endsWith("@stevens.edu"), {
          message: "You must use a Stevens email address (@stevens.edu)",
        }),
      password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(128, "Password must be 128 characters or fewer")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[0-9]/, "Password must contain at least one number")
        .regex(
          /[^a-zA-Z0-9]/,
          "Password must contain at least one special character",
        ),
      role: z.enum(["student", "course coordinator"] as const, {
        message: "Role must be student or course coordinator",
      }),
      school: schoolSchema.optional(),
      major: majorSchema.optional(),
    })
    .superRefine((body, ctx) => {
      const hasSchool =
        typeof body.school === "string" && body.school.length > 0;
      const hasMajor = typeof body.major === "string" && body.major.length > 0;

      if (body.role === "student") {
        if (!hasSchool) {
          ctx.addIssue({
            code: "custom",
            path: ["school"],
            message: "School is required for students",
          });
        }
        if (!hasMajor) {
          ctx.addIssue({
            code: "custom",
            path: ["major"],
            message: "Major is required for students",
          });
        }
      }

      if (hasMajor && !hasSchool) {
        ctx.addIssue({
          code: "custom",
          path: ["school"],
          message: "School is required when selecting a major",
        });
      }

      if (
        hasSchool &&
        hasMajor &&
        !MAJORS_BY_SCHOOL[body.school!]?.includes(body.major!)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["major"],
          message: "Major must belong to the selected school",
        });
      }
    }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1)
      .max(100)
      .regex(
        /^[a-zA-Z\s'-]+$/,
        "Name can only contain letters, spaces, hyphens, and apostrophes",
      )
      .optional(),
    email: z.string().email().optional(),
  }),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

export const verifyCodeSchema = z.object({
  body: z.object({
    code: z.string().regex(/^\d{6}$/, "Code must be a 6-digit number"),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email address"),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Password must be 128 characters or fewer")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(
        /[^a-zA-Z0-9]/,
        "Password must contain at least one special character",
      ),
  }),
});

export const userSchemas = {
  updateProfile: updateProfileSchema,
  changePassword: changePasswordSchema,
};
