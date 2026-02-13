import { HttpStatusCode } from "axios";
import { NextFunction, Request, Response } from "express";
import { ValidationError } from "yup";
import { internalServerError, newError } from "./statusCodes";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {

    if (err instanceof InternalError) {
        newError(res, err.message, err.statusCode || HttpStatusCode.BadRequest)
        return
    } else if (err instanceof SyntaxError) {
        internalServerError(res, "Invalid request body provided.")
        return
    } else {
        console.error({ title: "Unhandled error:", err, timestamp: new Date() });
        internalServerError(res, "Internal Server Error")
    }

    return
};

export class InternalError extends Error {
    constructor(

        public generalError: unknown,
        public customMessage?: string,
        public statusCode?: HttpStatusCode

    ) {
        let message = customMessage
        // let statusCode = statusCode 
        if (generalError instanceof InternalError || generalError instanceof ValidationError) {
            message = generalError.message
        }
        super(message || "Something went wrong, Kindly try again or contact support");
    }
}