import { z } from "zod";
import { ALL_MAJORS } from "../constants/schools";

export const registerSchema = z.object({
  body: z.object({
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
    major: z
      .string()
      .min(1, "Please select your major")
      .refine((val) => (ALL_MAJORS as readonly string[]).includes(val), {
        message: "Please select a valid major",
      }),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
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
    })
    .strict(),
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
