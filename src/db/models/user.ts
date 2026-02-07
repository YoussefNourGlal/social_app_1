import { Types, Schema, models, model, UpdateQuery } from "mongoose";
import { Model } from "mongoose";
import { HydratedDocument } from "mongoose";
import { date } from "zod";
import { badRequest } from "../../utils/response/response.error";
import { hashing } from "../../utils/security/hash";
import { Emailevent } from "../../utils/events/email";
import { TokenModel } from "./tokens";
import { tokenRepository } from "../repository/token.repository ";
export enum gendertype {
  male = "male",
  female = "female",
}

export enum roletype {
  user = "user",
  admin = "admin",
}

export interface IUser {
  _id: Types.ObjectId;

  firstName: string;
  lastName: string;
  username?: string;
  email: string;

  confirmEmailOTP?: string;
  confirmedAt?: Date;
  changeCredientialsTime?: Date;

  password: string;
  slug: string;

  resetPasswordOTP?: string;
  profileImage?: string;
  coverImage?: string[];
  friends?: Types.ObjectId[];
  phone?: string;
  address?: string;

  gender: gendertype;
  role: roletype;

  createdAt: Date;
  updatedAt?: Date;
  freezAt?: Date;
  freezBy?: Types.ObjectId;
  restoreAt?: Date;
  restoreBy?: Types.ObjectId;
}

export const userSchema = new Schema<IUser>(
  {
    firstName: { type: String, required: true, minLength: 2, maxLength: 25 },

    lastName: { type: String, required: true, minLength: 2, maxLength: 25 },
    slug: { type: String, required: true, minLength: 5, maxLength: 51 },

    email: { type: String, required: true, unique: true },
    changeCredientialsTime: Date,

    confirmEmailOTP: { type: String },

    confirmedAt: { type: Date },

    password: { type: String, required: true },

    resetPasswordOTP: { type: String },
    profileImage: { type: String },
    coverImage: { type: [String] },

    phone: { type: String },

    address: { type: String },

    gender: {
      type: String,
      enum: Object.values(gendertype),
      default: gendertype.male,
    },
    freezAt: Date,
    freezBy: { type: Schema.Types.ObjectId, ref: "user" },
    restoreAt: Date,
    restoreBy: { type: Schema.Types.ObjectId, ref: "user" },

    friends: [{ type: Schema.Types.ObjectId, ref: "user" }],

    role: {
      type: String,
      enum: Object.values(roletype),
      default: roletype.user,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);
userSchema
  .virtual("username")
  .set(function (value: string) {
    let [firstName, lastName] = value.split(" ") || [];
    this.set({ firstName, lastName, slug: value.replace(/\s+/g, "-") });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });

userSchema.pre(
  "save",
  async function (
    this: HUserDocument & { wasnew?: boolean; confirmPlaneOTP?: string },
    next,
  ) {
    if (this.isModified("password")) {
      this.password = await hashing(this.password);
    }
    if (this.isModified("confirmEmailOTP")) {
      this.confirmPlaneOTP = this.confirmEmailOTP as string;
      this.confirmEmailOTP = await hashing(this.confirmEmailOTP);
    }

    this.wasnew = this.isNew;
  },
);

userSchema.post("save", async function (doc, next) {
  let that = this as HUserDocument & {
    wasnew?: boolean;
    confirmPlaneOTP?: string;
  };
  if (that.wasnew && that.confirmPlaneOTP) {
    await Emailevent.emit("confirmEmail", {
      otp: that.confirmPlaneOTP,
      username: this.username,
      to: this.email,
    });
  }
});

export let usermodel: Model<IUser> = models.user || model("user", userSchema);
export type HUserDocument = HydratedDocument<IUser>;
