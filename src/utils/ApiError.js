// eta core nodemon.js use kore likhse

class ApiError extends Error {
    constructor(
        statusCode,
        message = "Something went wrong",
        errors = [],
        stack = ""
    ){
        super(message)
        this.statusCode = statusCode
        this.message = message
        this.success = false
        this.errors = errors
        
        // nicher if else part ta ektu hard way tei dekhaise eta aro simple way teo likha jay jeta pore bujhle shikhbo
        if(stack){
            this.stack = stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
}

export {ApiError}