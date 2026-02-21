import { object, string } from "yup";
import jwt from "jsonwebtoken";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { HttpStatusCode } from "axios";
import { SECRETS } from "../../../helpers/util/secrets";
import { prisma } from "../../../helpers/db/client";

export const VerifyDTO  = object(
    {
        token: string().required("Broken Url provided")
    }
)

export type TVerifyDTO = typeof VerifyDTO.__outputType

export function validateToken(dto: TVerifyDTO){
    try {
            const decoded = jwt.verify(dto.token, SECRETS.JWT_SECRET);
            return decoded as any
        } catch (err) {
            throw new InternalError(null, "Token expired.", HttpStatusCode.Unauthorized);
        }
}

export async function setUserIdVerified(userUid: string){
    await prisma.users.update(
        {
            where: {
                uid: userUid
            },
            data: {
                verified: true
            }
        }
    )
}
