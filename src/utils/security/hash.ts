import bcrypt from "bcrypt"; 


export let hashing=async function(data:string="",saltRound:number=12):Promise<string>{
    let hashingData= await bcrypt.hash(data,saltRound);
    return hashingData;
}

export let compare=async function(data:string,hash:string):Promise<boolean>{
    let hashingData= await bcrypt.compare(data,hash);
    return hashingData;
}


