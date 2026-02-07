import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { IPost } from "../models/post";


export  class postRepository extends DatabaseRepository<IPost> {
     constructor(protected override model: Model<IPost>) {
        super(model);

     }

}