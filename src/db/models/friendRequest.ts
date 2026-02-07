import { HydratedDocument, Types } from "mongoose";
import { Schema, models, model, Model } from "mongoose";

export interface IfriendRequest {
  createdBy: Types.ObjectId;
  sendTo: Types.ObjectId;
  acceptedAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

const friendRequestSchema = new Schema<IfriendRequest>(
  {
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    sendTo: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "user",
    },
    acceptedAt: Date,
  },

  { timestamps: true },
);

export let friendRequestmodel: Model<IfriendRequest> =
  models.friendRequest ||
  model<IfriendRequest>("friendRequest", friendRequestSchema);
export type HfriendRequestDocument = HydratedDocument<IfriendRequest>;
