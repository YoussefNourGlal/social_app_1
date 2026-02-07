import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { IfriendRequest } from "../models/friendRequest";


export  class friendRequestRepository extends DatabaseRepository<IfriendRequest> {
     constructor(protected override model: Model<IfriendRequest>) {
        super(model);

     }

}