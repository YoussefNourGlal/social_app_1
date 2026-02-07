import * as z from "zod";
import { getAllPostSchema } from "./postValidation";


export type ISgetAllPostDto=z.infer<typeof getAllPostSchema.body>;
