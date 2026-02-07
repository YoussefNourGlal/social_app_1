import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { IComment } from "../models/comment";


export  class commentRepository extends DatabaseRepository<IComment> {
     constructor(protected override model: Model<IComment>) {
        super(model);

     }

}