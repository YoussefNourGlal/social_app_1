import { Server as HttpServer } from "node:http";
import { Server, Socket } from "socket.io";
import { decodedToken, typeTokenEnum } from "../../middleWare/authMiddleware";
import { IAuthsocket } from "./gateway.dto";
import { ChatGateway } from "../chat/chat.gateway";

let io: Server | null = null;
export let inialize = (httpServer: HttpServer) => {
  // http://localhost:3000/
  io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  let connectedSockets = new Map<string, string[]>();
  // socket io middleware
  io.use(async (socket: IAuthsocket, next) => {
    try {
      const { user, decoded } = await decodedToken(
        typeTokenEnum.access,
        socket.handshake.auth.authorization,
      );
      socket.credentials = { user, decoded };
      const userTabs = connectedSockets.get(user._id.toString()) || []; // get all tabs
      userTabs.push(socket.id);
      connectedSockets.set(user._id.toString(), userTabs);
      next();
    } catch (error: any) {
      next(error);
    }
  });

  let chateGateWay = new ChatGateway();
  io.on("connection", (socket: IAuthsocket) => {
    chateGateWay.register(socket, getIo());

    socket.on("disconnect", () => {
      const userId = socket.credentials?.user?._id?.toString() as string;

      let remainingTabs = connectedSockets.get(userId)?.filter((tab) => {
        return tab !== socket.id;
      });

      if (remainingTabs?.length) {
        connectedSockets.set(userId, remainingTabs);
      } else {
        connectedSockets.delete(userId);
      }
      console.log(`After Delete :::`);
      console.log(connectedSockets);
    });
  });
};

export const getIo = (): Server => {
  if (!io) {
    throw new Error("Socket.id not intialized");
  }
  return io;
};
