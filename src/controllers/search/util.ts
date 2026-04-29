import {number, object, string} from "yup";
import { prisma } from "../../helpers/db/client";

export const InsertSearchSchema = object(
    {
        text: string().required("Missing value of text in search dto"),
        source: string().required("Missing value of source in search dto"),
        businessUid: string().required("Missing value of businessUid in search dto")
    }
)

export type TInsertSearchDTO = typeof InsertSearchSchema.__outputType;

export async function insertSearchParameters(dto: TInsertSearchDTO){
    await prisma.search.create(
        {
            data: dto
        }
    )
}



// for getting search outputs
export const GetSearchSchema = object(
    {
        text: string().required("Missing value of text in search dto"),
        businessUid: string().required("Missing value of businessUid in search dto"),
        page: number().default(1)
    }
)

export type TGetSearchDTO = typeof GetSearchSchema.__outputType;


export async function getSearchOutputs(d:TGetSearchDTO){
    return await prisma.search.paginate(
        {
            where: {
                text: {
                    contains: d.text,
                    mode: "insensitive"
                    
                },
                businessUid: d.businessUid
            },
            select: {
                text: true,
                source: true
            }
        }
    ).withPages(
        {
            page: d.page,
            limit: 10,
            includePageCount: true
        }
    )
}