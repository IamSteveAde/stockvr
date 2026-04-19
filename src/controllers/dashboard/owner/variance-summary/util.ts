import { date, number, string, object } from "yup"
import { prisma } from "../../../../helpers/db/client";
import { subDays } from "date-fns";



export const VARsummary = object(
    {
        startDate:date().default(subDays(new Date(), 7)),
        endDate:  date().default(new Date()),
        businessUid: string().required("sikeeeeee.")
    }
)

export type TVARsummary = typeof VARsummary.__outputType;

export async function getShiftVarianceCount(dto: TVARsummary) {

    return await prisma.shift.count(
        {
            where: {
                businessUid: dto.businessUid,
                variances: {
                    some: {
                        createdAt: {
                            gte: dto.startDate,
                            lte: dto.endDate
                        },
                        variance: {
                            lt: 0
                        }
                    }
                }
            },

        }
    )
}


export async function getHighestVariantShiftForPeriod(dto: TVARsummary) {

    const item = await prisma.shift.findMany(
        {
            where: {
                businessUid: dto.businessUid,
                variances: {
                    some: {
                        createdAt: {
                            gte: dto.startDate,
                            lte: dto.endDate
                        },
                        variance: {
                            lt: 0
                        }
                    }
                }
            },
            include: {

                baseShift: {
                    include: {
                        staffInCharge: true
                    }
                },
                variances: {
                    where: {
                        variance: {
                            lt: 0

                        }
                    },
                    include: {
                        linkedInventory: {
                            include: {
                                product: true
                            }
                        }
                    }

                }
            },
            take: 1,
            orderBy:{
                variances: {
                    _count: "desc"
                }
            }
        }
    )

    return {
        name: item?.[0]?.baseShift.name,
        date: item?.[0]?.date,
        itemsAffected: item?.[0]?.variances.length,
        staffInCharge: item?.[0]?.baseShift.staffInCharge.name
    }
}



export async function getTotalDescrepancies(dto: TVARsummary) {
   return await prisma.variance.count(
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

            }
        }
    )
}


