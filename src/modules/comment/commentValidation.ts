import { z } from "zod";
import { filevalidation } from "../../utils/multer/cloud.multer";

export const createCommentSchema = {
  params: z.strictObject({
    postId: z.string(),
  }),
  body: z
    .strictObject({
      content: z.string().min(2).max(500000).optional(),

      attachments: z
        .array(
          z
            .object({
              mimetype: z.string(),
              size: z.number(),
            })
            .refine((file) => filevalidation.images.includes(file.mimetype), {
              message: "Invalid image type",
            }),
        )
        .max(3)
        .optional(),
      tags: z.array(z.string()).max(20).optional(),
      commentId: z.string().optional(),
    })
    .superRefine((data, ctx) => {
      if (!data.attachments?.length && !data.content) {
        ctx.addIssue({
          code: "custom",
          path: ["content"],
          message: "Please provide content or attachments",
        });
      }
      if (
        data.tags?.length &&
        data.tags.length !== [...new Set(data.tags)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["tags"],
          message: "Please provide unique tags",
        });
      }
    }),
};
