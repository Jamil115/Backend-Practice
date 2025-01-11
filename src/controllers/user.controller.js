import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";


// ei access ar refresh token er code ekhanei alada method e na niye normally likha jaito but ei access and refresh token onek lage tai alada ekta method e kora hoise jate pore easily kaje lagano jay. 
const generateAccessAndRefreshTokens = async(userId) => 
{
    try {
        const user = await User.findById(userId)
        const accessToken =  user.generateAccessToken()     //generating access token for that user which was fetched by using userId
        const refreshToken =  user.generateRefreshToken()   //generating refresh token for that user which was fetched by using userId

        user.refreshToken = refreshToken    //In this line the generated tokens has been sent to the client
        user.save({validateBeforeSave: false})     //jehetu notun refreshToken er value pathano hoyeche tahole oita mongoDB te save o kora lagbe tai oita save kora hocche ei line e. Ar parameter ta use korar karon hocche jate konokisu validate na korei value ta save kore dey karon shudhu ekta field er value e change kortesi so password ba onno kisu jhamela korte pare tai eta dewa.
        return {accessToken, refreshToken}

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// eta ekta method banailam jeta kono route er kono url generate hoile eta kaj korbe. 
const registerUser = asyncHandler( async (req, res) => {

    // get user details from frontend
    const { fullName,email,username,password } = req.body

    //validation
    if(
        [ fullName,email,username,password ].some((field)=> 
            field?.trim() === "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // check if user already exists: user, email
    const existedUser =  await User.findOne({
        $or : [{ username }, { email }]
    })
    if(existedUser){
        throw new ApiError(409, "User with email or username exists")
    }

    // check for images, check for avatar
    // const avatarLocalPath = req.files?.avatar[0]?.path
    // const coverImageLocalPath = req.files?.coverImage[0]?.path;

    console.log("reqFiles: ",req.files)

    // uporer jevabe ek line e korsilam oivabeo kora jaito but oivabe korle coverImage postman e faka rekhe register korle error ashe karon undefined ashe tokhon
    let avatarLocalPath;
    if(req.files && Array.isArray(req.files.avatar) && req.files.avatar.length>0){
        avatarLocalPath = req.files.avatar[0].path
    }

    // uporer jevabe ek line e korsilam oivabeo kora jaito but oivabe korle coverImage postman e faka rekhe register korle error ashe karon undefined ashe tokhon
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    if(!avatarLocalPath){
        throw new ApiError(400, "Avatar file is required")
    }

    // upload them to cloudinary, avatar 
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!avatar){
        throw new ApiError(400, "Avatar file is requireddd")
    }

    // create user object - create entry in db
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage?.url || "",
        email,
        password,
        username: username.toLowerCase()
    })

    //remove password and refresh token field from response
    const createdUser = await User.findById(user._id).select("-password -refreshToken")

    //check for user creation
    if(!createdUser){
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    // return res 
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered Successfully")
    )
})

const loginUser = asyncHandler(async (req,res) => {
    // What tasks I need to do for login:
    //1. req.body -> data
    //2. username or email must required
    //3. find user
    //4. password check 
    //5. access and refresh token
    //6. send cookie


    //req.body -> data
    const {email, username, password} = req.body

    //username or email must required
    if(!username || !email){
        throw new ApiError(400, "username or email is required")
    }

    //find user
    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    // password check 
    const isPasswordValid = user.isPasswordCorrect(password)   //mongoose er je userSchema model ta ase oita "User" naame model ta banano hoise (export er line ta dekhlei bujhbo). So eta hocche mongoose er model so etar bhitorer findOne, findById erokom jotogula built in ase use kora jabe but ei "isPasswordCorrect" egula amader nijer banano methods chilo ar ei nijer banano method gula user je object ta ashe tar moddher individual taakei use kore kaaj korte hoy tai ekhane "User" na niye "user" nite hoise

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    //5. access and refresh token => etar shudhu nicher ek line e na. Uporer generateAccessAndRefreshTokens method tao etar part
    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    //6. send cookie
    const loggedInUser = await User.findById(user._id).select("-password -refreshToken")
    const options = {     //cookies pathar agey amader kisu options set kora lage tar moddhe ei duita hocche jate je kew cookies gula modify na korte pare only server thekei jate egula modify kora jay arki, frontend er manushjon shudhu dekhte parbe but modify korte parbe na.
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )
})

const logoutUser = asyncHandler(async (req,res) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )
    const options = {     //cookies pathar agey amader kisu options set kora lage tar moddhe ei duita hocche jate je kew cookies gula modify na korte pare only server thekei jate egula modify kora jay arki, frontend er manushjon shudhu dekhte parbe but modify korte parbe na.
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    ,json(new ApiResponse(200, {}, "User logged Out"))
})

export {
    registerUser,
    loginUser,
    logoutUser
}
