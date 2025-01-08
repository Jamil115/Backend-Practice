// nicher 2 niyomei kora jay. Industry te duitai use hoy.

//1st way
// const asyncHandler = (fn) => async (req, res, next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
//     }
// }

// 2nd way 
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch((err) => next(err))
    }
}


export {asyncHandler}