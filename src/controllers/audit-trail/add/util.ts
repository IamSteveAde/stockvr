import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";


export const ACTIONS = ["Product Created", "Product Edited", "Product Archived", "Inventory Adjusted", "Stock In", "Stock Out", "Shift Started", "Shift Ended"]
export const AddAuditTrailDTO = object(
    {
        businessUid: string().required("Missing value of business"),
        staffUid: string().required("Missing value of staff identifier"),
        action: string().oneOf(ACTIONS),
        shiftUid: string(),
        productUid: string(), 
        detail: string().required("Missing value of detail")

    }
)

export type TAddAuditTrailDTO = typeof AddAuditTrailDTO.__outputType;

export async function addTrail(dto: TAddAuditTrailDTO){
    await prisma.auditTrail.create(
        {
            data: {
                ...dto
            }
        }
    )
}