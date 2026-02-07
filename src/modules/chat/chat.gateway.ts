import { Server } from "socket.io";
import { IAuthsocket } from "../gateway/gateway.dto";
import { ChatEvent } from "./chat.events";


export class ChatGateway {
private _chatevent=new ChatEvent();
constructor() {}

register = (socket: IAuthsocket,io:Server) =>{
this._chatevent.sayHi(socket,io);
this._chatevent.sendMessage(socket,io);
this._chatevent.joinRoom(socket,io);
this._chatevent.sendGroupMessage(socket,io);
}



}