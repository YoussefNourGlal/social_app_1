import { Request, Response } from "express";
import { usermodel } from "../../db/models/user";
import { userRepository } from "../../db/repository/user.repository";
import { Types } from "mongoose";
import { badRequest } from "../../utils/response/response.error";
import {
  ICreateGroupChatDTO,
  IGetChatDTO,
  IGetGroupChatDTO,
  IjoinGroupDTO,
  ISayHiDTO,
  IsendGroupMessageDTO,
  IsendMessageDTO,
} from "./dto";
import { chatRepository } from "../../db/repository/chat.repository ";
import { ChatModel } from "../../db/models/chat";
import { v4 as uuid } from "uuid";

export class chatService {
  private userModel = new userRepository(usermodel);
  private _chatModel = new chatRepository(ChatModel);
  constructor() {}

  //REST API//

  getChat = async (req: Request, res: Response) => {
    const { userId } = req.params as IGetChatDTO;
    // ovo
    const chat = await this._chatModel.findOne({
      filter: {
        particiants: {
          $all: [
            req.user?._id as Types.ObjectId,
            Types.ObjectId.createFromHexString(userId),
          ],
        },
        group: { $exists: false },
      },
      options: {
        populate: "particiants",
      },
    });

    if (!chat) {
      throw new badRequest("Fail to Find Chat");
    }

    return res.status(200).json({
      chat,
    });
  };

  createGroupChat = async (req: Request, res: Response) => {
    const { particiants, group } = req.body as ICreateGroupChatDTO;

    const dbParticipants = particiants.map((participant) => {
      return Types.ObjectId.createFromHexString(participant);
    });

    const users = await this.userModel.find({
      filter: {
        _id: { $in: dbParticipants },
        friends: { $in: [req.user?._id as Types.ObjectId] },
      },
    });
    

    if (dbParticipants.length != users.length)
      throw new badRequest("Please Provide valid dbParticipants");

    const roomId = uuid();

    const [newGroup] =
      (await this._chatModel.create({
        data: [
          {
            createdBy: req.user?._id as Types.ObjectId,
            group,
            roomId,
            particiants: [...dbParticipants, req.user?._id as Types.ObjectId],
          },
        ],
      })) || [];

    if (!newGroup) throw new badRequest("Fail to create Group chat");

    return res.status(200).json({ message: "Done", data: { newGroup } });
  };

  getGroupChat = async (req: Request, res: Response) => {
    const { groupId } = req.params as IGetGroupChatDTO;

    const chat = await this._chatModel.findOne({
      filter: {
        _id: Types.ObjectId.createFromHexString(groupId),
        group: { $exists: true },
        particiants: { $in: [req.user?._id as Types.ObjectId] },
      },
      options: {
        populate: "messages.createdBy",
      },
    });

    if (!chat) throw new badRequest("Fail to Find Chat");

    return res.status(200).json({ message: "Done", data: { chat } });
  };

  // I0 //

  sayHi = ({ message, socket, callback, io }: ISayHiDTO) => {
    try {
      callback ? callback("I Recived Your Message") : undefined;
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };

  sendMessage = async ({ content, socket, sendTo, io }: IsendMessageDTO) => {
    try {
      let createdBy = socket.credentials?.user._id as Types.ObjectId;

      let check = await this.userModel.findOne({
        filter: {
          _id: Types.ObjectId.createFromHexString(sendTo),
          friends: { $in: [createdBy] },
        },
      });
      if (!check) {
        throw new badRequest("sorry the friend not found");
      }
      const chat = await this._chatModel.findOneAndUpdate({
        filter: {
          particiants: {
            $all: [
              createdBy as Types.ObjectId,
              Types.ObjectId.createFromHexString(sendTo),
            ],
          },
          group: { $exists: false },
        },
        update: {
          $addToSet: {
            messages: {
              content,
              createdBy,
            },
          },
        },
      });

      if (!chat) {
        const [newchat] =
          (await this._chatModel.create({
            data: [
              {
                createdBy,
                messages: [{ content, createdBy }],
                particiants: [
                  createdBy,
                  Types.ObjectId.createFromHexString(sendTo),
                ],
              },
            ],
          })) || [];
        if (!chat) {
          throw new badRequest("fail to create chat");
        }
      }
      io.emit("successMessage", { content });
      io.emit("newMessage", { content, from: createdBy });
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };

  joinRoom = async ({ roomId, socket, io }: IjoinGroupDTO) => {
    try {
      let chat = await this._chatModel.findOne({
        filter: {
          roomId: roomId,
          particiants: {
            $in: [socket.credentials?.user._id as Types.ObjectId],
          },
          group: { $exists: true },
        },
      });
      if (!chat) {
        throw new badRequest("fail to join room");
      }
      socket.join(chat.roomId as string);
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };

  sendGroupMessage = async ({
    content,
    socket,
    groupId,
    io,
  }: IsendGroupMessageDTO) => {
    try {
      let createdBy = socket.credentials?.user._id as Types.ObjectId;

      const chat = await this._chatModel.findOneAndUpdate({
        filter: {
          _id: Types.ObjectId.createFromHexString(groupId),
          particiants: {
            $in: [createdBy as Types.ObjectId],
          },
          group: { $exists: true },
        },
        update: {
          $addToSet: {
            messages: {
              content,
              createdBy,
            },
          },
        },
      });

      if (!chat) {
        throw new badRequest("fail to find group chat");
      }
      socket.emit("successMessage", { content });
      socket.to(chat.roomId as string).emit("newMessage", {
        content,
        from: createdBy,
        groupId,
      });
    } catch (error) {
      socket.emit("custom_error", error);
    }
  };
}
export default new chatService();
