import { object, string, number, date } from "yup"
import { prisma } from "../../../helpers/db/client";

export const VarianceAlertDTO = object(
    {
        startDate: date().default(new Date()),
        endDate: date().default(new Date()),
        severity: string().oneOf(["high", "low", "all", "medium"]),
        t: string(),
        page: number().default(1),
        pageLimit: number().default(10),
        businessUid: string().required("sikeeeeee.")

    }
)

export type TVarianceAlertDTO = typeof VarianceAlertDTO.__outputType;

export async function getVarianceAlerts(dto: TVarianceAlertDTO) {
    return await prisma.variance.paginate(
        {
            where: {
                businessUid: dto.businessUid,
                createdAt: {
                    gte: dto.startDate,
                    lte: dto.endDate
                },
                variance: {
                    lt: 0
                }
            },
            include: {
                linkedInventory: {
                    include: {
                        product: true
                    }
                },
                baseShift: true
            }

        }
    ).withPages(
        {
            page: dto.page,
            limit: dto.pageLimit,
            includePageCount: true
        }
    )
}

export function getVarianceAlertsDAO(data: Awaited<ReturnType<typeof getVarianceAlerts>>) {
    return {
        meta: data[1],
        alert: data[0].map(item => {
            return {
                date: item.createdAt,
                name: item.linkedInventory.product.name,
                unit: item.linkedInventory.product.unit,
                variance: item.variance,
                shift: item.baseShift.name,
                shiftId: item.baseShift.uid,
                severity: getSeverity(item.variance)
            }
        })
    }

}

function getSeverity(variance: number) {
    if (0 > variance && variance >= -10) {
        return "low"
    }
    else if (-10 > variance && variance > -15) {
        return "medium"
    }
    else if (-15 > variance) {
        return "high"
    }

    return "low"
}

