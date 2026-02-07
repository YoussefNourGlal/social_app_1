import { HydratedDocument } from "mongoose";
import { QueryFilter } from "mongoose";
import { ProjectionType } from "mongoose";
import { QueryOptions } from "mongoose";
import { DatabaseRepository } from "./database.repository";
import { IUser } from "../models/user";
import { Model } from "mongoose";
import { CreateOptions } from "mongoose";
import { badRequest } from "../../utils/response/response.error";

export  class userRepository extends DatabaseRepository<IUser> {
     constructor(protected override model: Model<IUser>) {
        super(model);

     }

     async createuser({
         data=[],
         options={},
       }: {
         data: Partial<IUser>[];
         options?: CreateOptions;
       }) {
        const [user]= (await this.create({data,options}))||[];
        if(!user){
            throw new badRequest("fail to sign up");
        }
        return user;
       }




}