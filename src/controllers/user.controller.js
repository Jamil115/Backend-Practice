import { asyncHandler } from "../utils/asyncHandler.js";

// eta ekta method banailam jeta kono route er kono url generate hoile eta kaj korbe. 
const registerUser = asyncHandler( async (req, res) => {
    console.log("Handler reached");    //this line write for a bug checking
    res.status(200).json({
        message: "ok"
    })
})

export {registerUser}
