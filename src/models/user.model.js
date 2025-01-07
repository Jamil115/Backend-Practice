import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
    {
        username: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true,
            index: true
        },
        email: {
            type: String,
            required: true,
            lowercase: true,
            unique: true,
            trim: true
        },
        fullName: {
            type: String,
            required: true,
            trim: true,
            index: true
        },
        avatar: {
            type: String,       //cloudinary url
            required: true
        },
        coverImage: {
            type: String        //cloudinary url
        },
        watchHistory: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Video"
            }
        ],
        password: {
            type: String,
            required: [true, 'Password is required']
        },
        refreshToken: {
            type: String
        }
    },
    {timestamps: true}
)

//ekhane arrow function use kora jabena karon arrow function e this thakena so evabe this likhe kono field er kaaj kora jabena tai evabe function(){} likhte hoyeche
userSchema.pre("save", async function(next) {           //ei function e exncryption kora hocche jeta ektu lengthy process tai etake async likha hoyeche ar parameter hishebe next ana hoyeche karon eta ekta middleware and ekhane next er use asei tai antei hoyeche.
    if(!this.isModified("password")) return next();      //ei line ta likhar karon hocche jemon onno kono field like shudhu avatar change kore save button press kora hole password abar encrypt hobe na. tai ei line likha hoyeche je shudhu password change kora holei password abar encrypt hobe.

    this.password = bcrypt.hash(this.password,10)
    next()
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(        //for jwt, summit's video is best
        {
            _id: this._id,      //ekhane shudhu id nilei hoito. Karon id unique so eta diyei define kora jay ke eta. Mon chaise beshi nite tai bakigulao nise.
            email: this.email,
            username: this.username,
            fullName: this.fullName
        },
        process.env.ACCESS_TOKEN_SECRET,
        { 
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
        // process.env.ACCESS_TOKEN_EXPIRY    //evabe likha jaito na?
    )
}
userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(      
        {
            _id: this._id,    
        },
        process.env.REFRESH_TOKEN_SECRET,
        { 
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
        
    )
}

export const User = mongoose.model("User", userSchema)