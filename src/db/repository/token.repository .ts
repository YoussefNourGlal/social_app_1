import { DatabaseRepository } from "./database.repository";
import { Model } from "mongoose";
import { IToken } from "../models/tokens";



export  class tokenRepository extends DatabaseRepository<IToken> {
     constructor(protected override model: Model<IToken>) {
        super(model);

     }

    



}