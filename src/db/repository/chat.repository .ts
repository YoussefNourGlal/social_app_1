import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { IChat } from "../models/chat";


export  class chatRepository extends DatabaseRepository<IChat> {
     constructor(protected override model: Model<IChat>) {
        super(model);

     }

}