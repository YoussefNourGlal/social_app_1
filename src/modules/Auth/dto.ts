import * as z from "zod";
import { confirmEmail, signupSchema,login } from "./validation";


export type ISsignupDto=z.infer<typeof signupSchema.body>;
export type ISconemail=z.infer<typeof confirmEmail.body>;
export type ISlogin=z.infer<typeof login.body>;