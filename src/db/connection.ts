import mongoose from "mongoose";


let mycon=async function () {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/socialApp",{serverSelectionTimeoutMS:5000});
        console.log("correct");
    } catch (error) {

         console.log("not correct",error);
    }
    
}

export default mycon;