import { object, string, number } from "yup";
import { prisma } from "../../../helpers/db/client";

export const ListStaffDTO = object({
    limit: number().default(20),
    page: number().default(1),
    businessUid: string().required("Business profile UID is required."),
    filter: string(),
    text: string().notRequired()
});

export type TListStaffDTO = typeof ListStaffDTO.__outputType;

export async function listStaff(dto: TListStaffDTO) {

    let q: Record<any, any> = {
        businessUid: dto.businessUid,
        status: dto.filter ?? undefined
    }

    if (dto.text) {

        q.OR = [
            { name: { contains: dto.text, mode: "insensitive" } },
            {
                owner: {
                    email: { contains: dto.text, mode: "insensitive" }
                }
            }
        ]

        
    }

    const staff = await prisma.userProfile.paginate({
        where: q,
        include: { owner: true }
    }).withPages({ page: dto.page, limit: dto.limit, includePageCount: true });

    return staff
}

export function listStaffDao(data: Awaited<ReturnType<typeof listStaff>>) {
    const item = data[0].map(s => ({
        uid: s.uid,
        name: s.name,
        email: s.owner.email,
        pin: s.pin,
        status: s.status,
        role: s.accessType
    }));

    return { staff: item, meta: data[1] }
}