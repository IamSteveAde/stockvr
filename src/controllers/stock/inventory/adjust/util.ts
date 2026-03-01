import { object, number, string } from "yup";
import { getProductRecord } from "../../products/archive/util";
import { prisma } from "../../../../helpers/db/client";

export const AdjustInventoryDTO = object(
    {
        productUid: string().required("Missing value of product identifier"),
        action: string().oneOf(["add", "reduce"]).required("Missing value of action"),
        quantity: number().required("Missing value of quantity"),
        businessUid: string().required("Missing value of business identifier.")
    }
)


export type TAdjustInventoryDTO = typeof AdjustInventoryDTO.__outputType;

export async function adjustInventory(dto: TAdjustInventoryDTO, product: Awaited<ReturnType<typeof getProductRecord>>) {

    // const product = await (dto)

    switch (dto.action) {
        case "add":
            await prisma.inventory.update(
                {
                    where: {
                        productUid: dto.productUid
                    },
                    data: {
                        quantity: {
                            increment: dto.quantity
                        }
                    }
                }
            )
            break
        case "reduce":
            const value = dto.quantity > product.inventory!.quantity ? 0 : dto.quantity
            await prisma.inventory.update(
                {
                    where: {
                        productUid: dto.productUid
                    },
                    data: {
                        quantity: {
                            decrement: value
                        }
                    }
                }
            )
            break
    }
}