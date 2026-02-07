import { HydratedDocument, Types } from "mongoose";
import { Schema, models, model, Model } from "mongoose";

export interface IComment {
  content?: string;
  attachments?: string[];
  tags?: Types.ObjectId[];
  likes?: Types.ObjectId[];
  postId: Types.ObjectId;
  commentId: Types.ObjectId;
  createdBy: Types.ObjectId;

  freezedBy?: Types.ObjectId;
  freezedAt?: Date;

  restoredBy?: Types.ObjectId;
  restoredAt?: Date;

  createdAt: Date;
  updatedAt?: Date;
}

const commentSchema = new Schema<IComment>(
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

    likes: [{ type: Schema.Types.ObjectId, ref: "user" }],

    tags: [{ type: Schema.Types.ObjectId, ref: "user" }],
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
    postId: {
      type: Schema.Types.ObjectId,
      ref: "post",
      required: true,
    },
    commentId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    restoredAt: Date,
  },

  { timestamps: true },
);

export let commentmodel: Model<IComment> =
  models.comment || model<IComment>("comment", commentSchema);
export type HCommentDocument = HydratedDocument<IComment>;
