import { string, z } from "zod";

export const getchatSchema = {
  params: z.strictObject({
    userId: z.string(),
  }),
};

export const getGroupChatSchema = {
  params: z.strictObject({
    groupId: z.string(),
  }),
};

export const createGroupChatSchema = {
  body: z
    .strictObject({
      particiants: z.array(string()).min(1),
      group: z.string().min(1).max(100),
    })
    .superRefine((data, ctx) => {
      if (
        data.particiants?.length &&
        data.particiants.length !== [...new Set(data.particiants)].length
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["participants"],
          message: "Please Provide unique participants",
        });
      }
    }),
};
