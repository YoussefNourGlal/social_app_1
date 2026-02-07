import * as z from "zod";
import { logoutSchema } from "./validation";

export type LogoutDTO=z.infer<typeof logoutSchema.body>;