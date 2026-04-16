import {object, string} from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { HttpStatusCode } from "axios";

export const DeleteShiftDTO = object(
    {
        shiftUid:string().required("Missing value of shift identifier")
    }
)

export type TDeleteShiftDTO = typeof DeleteShiftDTO.__outputType

export async function getSpecificShift(dto: TDeleteShiftDTO){
    const exists = await prisma.shift.findFirst(
        {
            where: {
                uid: dto.shiftUid
            },
            include: {
                baseShift: true
            }
        }
    )

    if(!exists){
        throw new InternalError(null, "Shift not found", HttpStatusCode.NotFound)
    }

    if(["ended", "running"].includes(exists.status.toLowerCase())){
        throw new InternalError(null, "Cannot delete a running/ended shift.")
    }

    return exists
}


export async function deleteShift(dto: Awaited<ReturnType<typeof getSpecificShift>> ){

    // there's a comma
    // what if shift is on multiple days and some have already started ? would it delete all shifts ?

    

}