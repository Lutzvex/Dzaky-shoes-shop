"use server";

import { db } from "@/lib/db";
import { contactMessages } from "@/lib/db/schema";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  message: z.string().min(1, "Message is required").max(5000),
});

export async function submitContactForm(formData: FormData) {
  const raw = {
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    message: formData.get("message") as string,
  };

  const data = contactSchema.parse(raw);

  await db.insert(contactMessages).values({
    name: data.name,
    email: data.email,
    message: data.message,
  });

  return { ok: true };
}
