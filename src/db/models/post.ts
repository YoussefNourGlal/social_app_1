import { HydratedDocument, Types } from "mongoose";
import { Schema, models, model, Model } from "mongoose";

export enum AllowCommentsEnum {
  ALLOW = "ALLOW",
  DENY = "DENY",
}

export enum AvailablityEnum {
  PUBLIC = "PUBLIC",
  FRIENDS = "FRIENDS",
  ONLYME = "ONLYME",
}

export enum LikeEnum {
  LIKE = "LIKE",
  UNLIKE = "UNLIKE",
}

export interface IPost {
  content?: string;
  attachments?: string[];
  allowComments: AllowCommentsEnum;
  avilablity: AvailablityEnum;
  assetPostFolderId?: string;
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];

  createdBy: Types.ObjectId;

  freezedBy?: Types.ObjectId;
  freezedAt?: Date;

  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt?: Date;
}

const postSchema = new Schema<IPost>(
  {
    content: {
      type: String,
      minlength: 2,
      maxlength: 500000,
      required: function () {
        if (!this.attachments?.length) {
          return true;
        } else {
          return false;
        }
      },
    },

    attachments: {
      type: [String],
    },

    allowComments: {
      type: String,
      enum: Object.values(AllowCommentsEnum),
      default: AllowCommentsEnum.ALLOW,
    },

    avilablity: {
      type: String,
      enum: Object.values(AvailablityEnum),
      default: AvailablityEnum.PUBLIC,
    },
    likes: [{ type: Schema.Types.ObjectId, ref: "user" }],

    tags: [{ type: Schema.Types.ObjectId, ref: "user" }],
    assetPostFolderId: String,
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    freezedBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    freezedAt: Date,

    restoredBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    restoredAt: Date,
  },

  { timestamps: true },
);

export let postmodel: Model<IPost> =
  models.post || model<IPost>("post", postSchema);
export type HPostDocument = HydratedDocument<IPost>;
