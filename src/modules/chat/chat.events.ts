import { Server } from "socket.io";
import { IAuthsocket } from "../gateway/gateway.dto";
import { chatService } from "./service";

export class ChatEvent {
  private _chatservice = new chatService();

  sayHi = (socket: IAuthsocket, io: Server) => {
    return socket.on("sayHi", (message, callback) => {
      this._chatservice.sayHi({ message, callback, socket, io });
    });
  };

  sendMessage = (socket: IAuthsocket, io: Server) => {
    return socket.on(
      "sendMessage",
      (data: { content: string; sendTo: string }) => {
        this._chatservice.sendMessage({ ...data, socket, io });
      },
    );
  };

  joinRoom = (socket: IAuthsocket, io: Server) => {
    return socket.on("join_room", ({ roomId }) => {
      this._chatservice.joinRoom({ roomId, socket, io });
    });
  };

  sendGroupMessage = (socket: IAuthsocket, io: Server) => {
    return socket.on(
      "sendGroupMessage",
      (data: { content: string; groupId: string }) => {
        this._chatservice.sendGroupMessage({ ...data, socket, io });
      },
    );
  };
}
