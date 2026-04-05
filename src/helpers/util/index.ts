import { ObjectSchema } from "yup";
import nodemailer from "nodemailer";
import { NextFunction, Request } from "express";
import { InternalError } from "../errorHandler/errorHandler";
import { HttpStatusCode } from "axios";

export async function validateDTO(DTOSchema: ObjectSchema<any, any>, params: any) {
    return await DTOSchema.validate(params)
}

export async function sendMail({ to, subject, html }: { to: string; subject: string; html: string }) {
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT),
        secure: true,
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    await transporter.sendMail({
        from: process.env.MAIL_FROM || process.env.SMTP_USER,
        to,
        subject,
        html
    });

    // transporter.close()
}


export function getProfileUidFromRequest(req: Request) {
    const payload = (req as any).jwtPayload;

    return payload?.userProfileUid
}

export function getBusinessIdFromRequest(req: Request) {
    const payload = (req as any).jwtPayload;

    if (payload.accessType != "owner") {
        throw new InternalError(null, "Unauthorized Access", HttpStatusCode.Unauthorized)
    }

    return { busId: payload?.businessUid, type: payload.accessType }
}
