import { object, string } from "yup"
import { prisma } from "../../../helpers/db/client";

export const ACTIONS_KEY = {
    productCreated: "Product Created",
    productEdited: "Product Edited",
    productArchived: "Product Archived",
    inventoryAdjusted: "Inventory Adjusted",
    stockIn: "Stock In",
    stockOut: "Stock Out",
    shiftStarted: "Shift Started",
    shiftEnded: "Shift Ended"
}
export const ACTIONS = Object.values(ACTIONS_KEY)
export const AddAuditTrailDTO = object(
    {
        businessUid: string().required("Missing value of business"),
        staffUid: string().required("Missing value of staff identifier"),
        action: string().oneOf(ACTIONS),
        shiftUid: string(),
        productUid: string(), 
        entity: string().required("Missing value of entity"),
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