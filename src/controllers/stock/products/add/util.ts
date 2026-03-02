import { object, string } from "yup";
import { prisma } from "../../../../helpers/db/client";
import { nanoid } from "nanoid";


export const AddPRoductDto = object(
    {
        name: string().required("Name of product required."),
        // uid: string().notRequired(),
        unit: string().oneOf(["kg", "litres", "bags", "pieces"]).required("Unit of measurement required."),
        businessUid: string().required("sikeeeeeeee.")
    }
)

export type TAddPRoductDto = typeof AddPRoductDto.__outputType;

export async function addProductRecord(dto: TAddPRoductDto) {
    return await prisma.products.create(
        {
            data: {
                uid: "STK-" + dto.name.slice(0, 3).toUpperCase() + "-" + nanoid(6),
                ...dto,
                inventory:{
                    create: {
                        uid: "INV-"+nanoid(12)
                    }
                }
            }
        }
    )
}

export function getProductDao(record: Awaited<ReturnType<typeof addProductRecord>>) {
    return {
        uid: record.uid,
        name: record.name,
        updatedAt: record.updatedAt,
        unit: record.unit,
        status: record.status,
        quantity: record?.inventory?.quantity || 0,
        inventoryUid: record.inventory?.uid || undefined
    }
}