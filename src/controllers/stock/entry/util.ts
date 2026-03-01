import { object, string, number } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { HttpStatusCode } from "axios";

export const StockEntryDTO = object(
    {
        shiftUid: string().required("Missing value of shift identifier."),
        staffUid: string().required("Missing value of staff identifier."),
        businessUid: string(),
        action: string().oneOf(["Stock In", "Stock Out"]).required("Missing value of action"),
        inventoryUid: string().required("Missing value of product inventory identifier"),
        quantity: number().required("Missing value of quantity"),
        reason: string().notRequired()
    }
)


export type TStockEntryDTO = typeof StockEntryDTO.__outputType;

export async function getShift(dto: { staffUid: string, shiftUid: string }) {
    const shift = await prisma.shift.findUnique(
        {
            where: {
                uid: dto.shiftUid
            },
            include: {
                baseShift: true
            }
        }
    )

    if (!shift) throw new InternalError(null, "Shift not found.")
    if (shift.status != "Running") throw new InternalError(null, "Stock entry only done for running shifts.")
    if (shift.baseShift.staffInChargeId != dto.staffUid) throw new InternalError(null, "Only staff in charge can add a stock entry.")
    return shift
}

export async function getStockInventory(uid: TStockEntryDTO["inventoryUid"]) {
    const inventory = await prisma.inventory.findUnique(
        {
            where: { uid }
        }
    )

    if (!inventory) {
        throw new InternalError(null, "Product inventory not found", HttpStatusCode.NotFound)
    }


    return inventory

}

export async function logStockEntry(dto: TStockEntryDTO, shift: Awaited<ReturnType<typeof getShift>>){
    dto.businessUid = shift.businessUid
    dto.shiftUid = shift.baseShiftUid

    await prisma.stockEntry.create(
        {
            data: {
                ...dto
            }
        }
    )

}