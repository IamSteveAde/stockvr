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

    const q = {
        businessUid: dto.businessUid,
        createdAt: {
            gte: dto.startDate,
            lte: dto.endDate
        },
        variance: getSeverityQuery(dto.severity),
        linkedInventory: dto.t ? {
            product: {
                name: {
                    contains: dto.t
                }
            }
        } : undefined

    }

    return await prisma.variance.paginate(
        {
            where: {
                businessUid: dto.businessUid,
                createdAt: {
                    gte: dto.startDate,
                    lte: dto.endDate
                },
                variance: getSeverityQuery(dto.severity),
                linkedInventory: dto.t ? {
                    product: {
                        name: {
                            contains: dto.t,
                            mode: "insensitive"
                        }
                    }
                } : undefined

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

function getSeverity(variance: number): "low" | "medium" | "high" {
    if (variance >= -10) return "low"    // 0 to -10
    if (variance >= -15) return "medium" // -10 to -15
    return "high"                        // below -15
}

function getSeverityQuery(x: TVarianceAlertDTO["severity"]) {
  switch (x) {
    case "low":
      return { gte: -10, lt: 0 }      // 0 to -10

    case "medium":
      return { gte: -15, lt: -10 }    // -10 to -15

    case "high":
      return { lt: -15 }              // below -15

    default:
      return undefined
  }
}

