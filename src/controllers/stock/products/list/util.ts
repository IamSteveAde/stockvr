import { object, string, number } from "yup"
import { prisma } from "../../../../helpers/db/client";
import { getProductDao } from "../add/util";

export const ListProductDTO = object(
    {
        businessUid: string().required("Sikeeeeee"),
        page: number().default(1),
        limit: number().default(10),
        text: string().notRequired()
    }
)


export type TListProductDTO = typeof ListProductDTO.__outputType;

export async function getProductsRecords(dto: TListProductDTO) {
    return await prisma.products.paginate(
        {
            where: {
                businessUid: dto.businessUid,
                name: dto.text ? {contains: dto.text, mode: "insensitive"} : undefined
            },
            include: {
                inventory: true
            }
        }
    ).withPages(
        {
            page: dto.page,
            limit: dto.limit,
            includePageCount: true
        }
    )
}

export function getProductsDao(records: Awaited<ReturnType<typeof getProductsRecords>>) {
    const products = records[0].map((product)=>{
        return getProductDao(product)
    })  

    return {products, meta: records[1]}
}
