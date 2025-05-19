import * as z from "zod";

export const feedbackSchema = z.object({
  rating: z.number().min(1, "Please select a rating").max(5),
  text: z.string().min(1, "Feedback text is required"),
});