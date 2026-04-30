import { object, string } from "yup"
import { prisma } from "../../../../helpers/db/client";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { HttpStatusCode } from "axios";


export const UpdateDTO = object(
    {
        businessUid: string().required("sikeeeeee"),
        uid: string().required("Missing product identifier"),
        name: string().notRequired(),
        unit: string().notRequired(),
    }
)

export type TUpdateDTO = typeof UpdateDTO.__outputType;


export async function getProductRecord(dto: TUpdateDTO) {
    const product = await prisma.products.findFirst(
        {
            where: {
                uid: dto.uid,
                businessUid: dto.businessUid
            },
            include: {
                inventory: true
            }
        }
    )

    if (!product) {
        throw new InternalError(null, "Product not found", HttpStatusCode.NotFound)
    }

    return product
}

export async function updateProductDetails(dto: TUpdateDTO) {
    const q = {
        name: dto.name ?? undefined,
        unit: dto.unit ?? undefined
    }
    await prisma.products.update(
        {
            where: { uid: dto.uid },
            data: {
                ...q,
                updatedAt: new Date()
            }
        }
    )
}