import {
  HydratedDocument,
  model,
  models,
  Schema,
  Types,
  Model,
} from "mongoose";

export interface IToken {
  jti: string;
  expiresIn: number;
  userId: Types.ObjectId;
}
export const tokenSchema = new Schema<IToken>(
  {
    jti: {
      type: String,
      required: true,
      unique: true,
    },
    expiresIn: {
      type: Number,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true },
);
// create model

export const TokenModel: Model<IToken> =
  models.Token || model<IToken>("Token", tokenSchema);
export type HTokenDocument = HydratedDocument<IToken>;
