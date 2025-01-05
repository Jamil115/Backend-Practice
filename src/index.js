import dotenv from "dotenv"
// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()
//The upper one is 2nd and most used way to connect database


//The lower one is first way to connect database
/*
import express from "express";
const app = express()

( async ()=>{
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        app.on("error", () => {
            console.log("ERR: ", error)
            throw error
        })

        app.listen(process.env.PORT, ()=> {
            console.log(`App is listening on port: ${process.env.PORT}`)
        })

    } catch (error) {
        console.log("Error: ",error);
        throw error
    }
})
    */