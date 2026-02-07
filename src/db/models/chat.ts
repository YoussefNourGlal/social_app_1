import {
  HydratedDocument,
  Model,
  model,
  models,
  Schema,
  Types,
} from "mongoose";

export interface IMessage {
  content: string;
  createdBy: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IChat {
  // Ovo
  particiants: Types.ObjectId[];
  messages: IMessage[];
  createdBy: Types.ObjectId;
  // ovm -- > groups
  group?: string;
  group_image?: string;
  roomId?: string;
  // common

  createdAt: Date;
  updatedAt?: Date;
}

export const messageSchema = new Schema<IMessage>(
  {
    content: {
      type: String,
      required: true,
      maxLength: 500000,
      minLength: 2,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
  },
  { timestamps: true },
);

export const chatSchema = new Schema<IChat>(
  {
    particiants: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "user",
      },
    ],
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    group: String,
    group_image: String,
    roomId: {
      type: String,
      required: function () {
        return this.roomId;
      },
    },
    messages: [messageSchema],
  },
  { timestamps: true },
);

export const ChatModel: Model<IChat> =
  models.Chat || model<IChat>("Chat", chatSchema);
export type HChatDocumnet = HydratedDocument<IChat>;
export type HMessageDocumnet = HydratedDocument<IMessage>;
