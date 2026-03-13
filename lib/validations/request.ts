import { z } from "zod";

export const requestUploadRegistrationSchema = z.object({
  filename: z.string().min(1).max(255),
  size: z.number().positive(),
  mimeType: z.string().min(1).max(255),
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address")
    .optional(),
});

export const requestUploadStatusSchema = z.object({
  fileId: z.string().uuid(),
  status: z.enum(["completed", "failed"]),
});

export type RequestUploadRegistrationInput = z.infer<
  typeof requestUploadRegistrationSchema
>;
export type RequestUploadStatusInput = z.infer<typeof requestUploadStatusSchema>;
