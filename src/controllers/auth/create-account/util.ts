import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import crypto from "node:crypto";
import { nanoid } from "nanoid";
import { ACCESS_TYPES } from "../../../helpers/accessTypes";


export const AccountDTO = object(
    {
        email: string().email("Invalid email format.").required("Email missing."),
        phoneNo: string().required("Phone number missing."),
        password: string().min(8, "Password cannot be less than 8 characters..").required("Password missing"),
    }
)

export const PWDDTO = object(
    {
        password: string().min(8, "Password cannot be less than 8 characters..").required("Password missing"),
    }
)

export type TAccountDTO = typeof AccountDTO.__outputType;

export type TPWDDto = typeof PWDDTO.__outputType;

export async function validateExistence(dto: TAccountDTO) {
    const user = await prisma.users.findFirst(
        {
            where: {
                email: dto.email
            }
        }
    )
    if (user) throw new InternalError(null, "User with email provided exists. Kindly reset your password to proceed.")
    return
}

export const hashPassword = (dto: TPWDDto): Promise<string> => {

    const password = dto.password

    return new Promise((resolve, reject) => {
        const salt = crypto.randomBytes(16).toString("hex"); // generate a random salt
        crypto.scrypt(password, salt, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(`${salt}:${derivedKey.toString("hex")}`);
        });
    });
};

export const verifyPassword = (dto: TPWDDto, storedHash: string): Promise<boolean> => {

    const password = dto.password
    return new Promise((resolve, reject) => {
        const [salt, key] = storedHash.split(":");
        crypto.scrypt(password, salt!, 64, (err, derivedKey) => {
            if (err) reject(err);
            resolve(key === derivedKey.toString("hex"));
        });
    });
};

export async function createUserRecord(dto: TAccountDTO) {
    return await prisma.users.create(
        {
            data: {
                uid: `ACC-${nanoid(24)}`,
                email: dto.email,
                password: await hashPassword({password: dto.password}),
                userProfiles: {
                    create: {
                        uid: `OWNER-${nanoid(12)}`,
                        accessType: ACCESS_TYPES.owner
                    }
                }
            }
        }
    )
}



