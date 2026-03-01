import { object, string} from "yup"
import { prisma } from "../../../../helpers/db/client";
import { InternalError } from "../../../../helpers/errorHandler/errorHandler";
import { HttpStatusCode } from "axios";


export const ArchiveDTO = object(
    {
        businessUid: string().required("sikeeeeee"),
        productUid: string().required("Missing product identifier"),
        status: string().oneOf(["Archived", "Active"]).required("Status required.")
    }
)

export type TArchiveDTO = typeof ArchiveDTO.__outputType;


export async function getProductRecord(dto: TArchiveDTO){
    const product = await prisma.products.findFirst(
        {
            where: {
                uid: dto.productUid,
                businessUid: dto.businessUid
            },
            include: {
                inventory: true
            }
        }
    )

    if(!product){
        throw new InternalError(null, "Product not found", HttpStatusCode.NotFound)
    }

    return product
}

export async function changeProductStatus(dto: TArchiveDTO){
    await prisma.products.update(
        {
            where: {uid: dto.productUid},
            data: {
                status: dto.status,
                updatedAt: new Date()
            }
        }
    )
}