import mongoose from "mongoose";
import { DB_NAME } from "../constants.js";

// 2nd and most used way to connect database
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        // console.log(connectionInstance.connection.name)
        // console.log(connectionInstance.connection.port)
        console.log(`\n MongoDB Connected!! DB HOST: ${connectionInstance.connection.host}`)
    } catch (err) {
        console.log("MongoDB Connection Failed ", err);
        process.exit(1)
    }
}

export default connectDB

