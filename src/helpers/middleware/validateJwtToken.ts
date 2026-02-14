import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { SECRETS } from "../util/secrets";
import { InternalError } from "../errorHandler/errorHandler";
import { HttpStatusCode } from "axios";


export function validateJwtToken(req: Request, res: Response, next: NextFunction) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new InternalError(null, "Authorization token missing or invalid.", HttpStatusCode.Unauthorized));
    }
    const token = authHeader.split(" ")[1];
    if (!token) {
        return next(new InternalError(null, "Authorization token missing.", HttpStatusCode.Unauthorized));
    }
    try {
        const decoded = jwt.verify(token, SECRETS.JWT_SECRET);
        console.log("Decoded JWT payload:", decoded);
        // Attach decoded token to request for use in controller
        (req as any).jwtPayload = decoded;
        
        next();
    } catch (err) {
        next(new InternalError(null, "Invalid or expired token.", HttpStatusCode.Unauthorized));
    }
}
