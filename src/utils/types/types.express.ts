import { HUserDocument } from "../../db/models/user";
import { MyJwtPayload } from "../security/token";

declare module "express-serve-static-core"{
interface Request{
    user?:HUserDocument,
    decoded?:MyJwtPayload
}

}