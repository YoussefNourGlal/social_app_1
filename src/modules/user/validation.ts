import { z } from "zod";
import { LogoutEnum } from "../../utils/security/token";

export const logoutSchema = {
  body: z.strictObject({
    flag: z.enum(LogoutEnum).default(LogoutEnum.ONLY),
  }),
};


export const  friendRequestSchema ={
params:z.strictObject({
  userId:z.string()
})
}


export const  acceptRequestSchema ={
params:z.strictObject({
 requestId:z.string()
})
}


export const forgetPass = {
  body: z.object({
    email: z
      .string()
      .email()
      .refine(
        (email) => {
          const domain = email.split(".").pop();
          return ["com", "net", "org"].includes(domain ?? "");
        },
        {
          message: "Invalid email TLD",
        }
      ),
  }),
};


export const resetpass = {
  body: z
    .object({
      password: z.string().min(1, "Password is required"),
      confirmpassword: z.string().min(1, "Confirm password is required"),
      otp: z.string().min(1, "OTP is required"),
      email: z
        .string()
        .email()
        .refine(
          (email) => {
            const domain = email.split(".").pop();
            return ["com", "net", "org"].includes(domain ?? "");
          },
          {
            message: "Invalid email TLD",
          }
        ),
    })
    .refine((data) => data.password === data.confirmpassword, {
      message: "Password and confirm password must match",
      path: ["confirmpassword"],
    }),
};



export const freezSchema ={
params:z.strictObject({
 userId:z.string()
})
}