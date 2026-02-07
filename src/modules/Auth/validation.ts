import * as z from "zod";

export let signupSchema = {
  body: z
    .strictObject({
      username: z
        .string({ message: "Username is required" })
        .min(3, { message: "Username must be at least 3 characters long" })
        .max(30, { message: "Username must be at most 30 characters long" }),
      email: z.email({ message: "Invalid Email Address" }),
      password: z.string(),
      confirmPassword: z.string(),
    })
    .superRefine(function (data, ctx) {
      if (data.password != data.confirmPassword) {
        ctx.addIssue({
          code: "custom",
          message: "password missmatch",
          path: ["confirmPassword"],
        });
      }
      if (data.username?.split(" ").length != 2) {
        ctx.addIssue({
          code: "custom",
          message: "name must have firstName and secondName",
          path: ["name"],
        });
      }
    }),
};

export let confirmEmail = {
  body: z.strictObject({
    email: z.email({ message: "Invalid Email Address" }),
    otp: z.string(),
  }),
};

export let login = {
  body: z.strictObject({
    email: z.email({ message: "Invalid Email Address" }),
    password: z.string(),
  }),
};
