const mongoose = require('mongoose');
const initData =  require('./data');
const Listing = require("../models/listing.js");
const MONGO_URL = "mongodb+srv://kiraPersonalDB:KiraDB2023@cluster0.qm8bgzb.mongodb.net/villa-venture";

main().then(()=>{
    console.log("Connected to DB");
})
.catch((err)=>{
    console.log(err);
})

async function main(){
    await mongoose.connect(MONGO_URL)
}
    
const initDB = async () => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({
        ...obj,
        owner: "66ae3d82dfbe0a6f3bffb273",
        geometry: {
      "type": "Point",
      "coordinates": [
        139.698775,
        35.664455
      ]
    }
    }))
    await Listing.insertMany(initData.data);
    console.log("data was initialized");
}

initDB();

