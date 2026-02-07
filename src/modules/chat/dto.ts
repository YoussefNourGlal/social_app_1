import * as z from "zod";
import { IAuthsocket } from "../gateway/gateway.dto";
import { createGroupChatSchema, getchatSchema, getGroupChatSchema } from "./validation";
import { Server } from "socket.io";


export interface ISayHiDTO{
message: string;
socket: IAuthsocket;
callback: any;
io:Server;
}


export interface IjoinGroupDTO{
    socket: IAuthsocket;
    roomId: string;
    io:Server;
    }

export interface IsendMessageDTO{
    content: string;
    socket: IAuthsocket;
    sendTo: string;
    io:Server;
    }

export interface IsendGroupMessageDTO{
        content: string;
        socket: IAuthsocket;
        groupId: string;
        io:Server;
        }

export type IGetGroupChatDTO = z.infer<typeof getGroupChatSchema.params>;
export type ICreateGroupChatDTO = z.infer<typeof createGroupChatSchema.body>;
export type IGetChatDTO = z.infer<typeof getchatSchema.params>;