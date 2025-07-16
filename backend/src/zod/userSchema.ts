import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().min(2, "username must be atleast 5 characters"),
  email: z.string().email("Invalid email format"),
  password: z
    .string()
    .min(6, "password must contain atleast 8 characters")
    .max(20),
});

export const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string(),
});
