import { Socket } from "socket.io";
import { HUserDocument } from "../../db/models/user";
import { MyJwtPayload } from "../../utils/security/token";

 
export interface IAuthsocket extends Socket {
credentials ?:{
user: Partial<HUserDocument>;
decoded: MyJwtPayload;
};
}