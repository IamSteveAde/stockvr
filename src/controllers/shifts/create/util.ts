import { object, string, date, boolean, array, Maybe } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { nanoid } from "nanoid";
import { eachDayOfInterval, getDay, isWithinInterval, format } from 'date-fns'
import { DateTime } from 'luxon'

export const CreateShiftDTO = object({
    name: string().required("Shift name is required."),
    startTime: string().required("Start time is required."),
    endTime: string().required("End time is required."),
    startDate: date().required("Shift start date is required."),
    endDate: date().notRequired(),
    isWeekly: boolean().default(false),
    repeatsOn: array(
        string().oneOf(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    ).default([]),
    staffInChargeUid: string().required("Provide staff in charge to proceed."),
    businessUid: string().required("You thought wrong.")
});

export const ShiftStaffsDTO = object(
    {
        linkedStaffUids: array(string().required("Staffs required under shift.")).required("Select staff members to attach to shift.")
    }
)

export type TCreateShiftDTO = typeof CreateShiftDTO.__outputType;
export type TShiftStaffsDTO = typeof ShiftStaffsDTO.__outputType;

const DAY_MAP: Record<string, number> = {
    SUNDAY: 0,
    MONDAY: 1,
    TUESDAY: 2,
    WEDNESDAY: 3,
    THURSDAY: 4,
    FRIDAY: 5,
    SATURDAY: 6,
}

export async function createShiftWithAssignments(input: TCreateShiftDTO & TShiftStaffsDTO) {
    const {
        name,
        startTime,
        endTime,
        startDate,
        endDate,
        isWeekly,
        repeatsOn,
        staffInChargeUid,
        linkedStaffUids,
    } = input

    // 1. figure out which dates shifts should be created on
    const shiftDates = resolveShiftDates({ startDate, endDate, isWeekly, repeatsOn })

    if (shiftDates.length === 0) {
        throw new Error('No valid shift dates found for the given range and repeat config')
    }

    // 2. create everything in a transaction
    const result = await prisma.$transaction(async (tx) => {

        // --- BaseShift ---
        const baseShift = await tx.baseShift.create({
            data: {
                uid: "BS-" + nanoid(12),
                name,
                startTime,
                endTime,
                startDate: new Date(startDate),
                endDate: endDate? new Date(endDate) :undefined ,
                isWeekly,
                // repeatsOn: repeatsOn?.length >0 ? repeatsOn : [] ,
                repeatsOn: repeatsOn,
                staffInChargeId: staffInChargeUid,
                businessUid: input.businessUid
            },
        })

        // --- ShiftAssignments + Shifts for each staff ---
        const assignments = await Promise.all(
            linkedStaffUids.map(async (staffUid) => {

                // create the assignment
                const assignment = await tx.shiftAssignment.create({
                    data: {
                        uid: "ASS-" + nanoid(12),
                        baseShiftUid: baseShift.uid,
                        staffUid,
                        businessUid: input.businessUid,
                    },
                })

                // create individual shift occurrences for this staff
                await tx.shift.createMany({
                    data: shiftDates.map((date) => ({
                        uid: "SH-" + nanoid(12),
                        baseShiftUid: baseShift.uid,
                        businessUid: input.businessUid,
                        shiftAssignmentUid: assignment.uid,
                        staffUid,
                        // date: toShiftDate(date),

                        date: new Date(date).toUTCString(),
                        startTime,
                        endTime,
                        status: 'PENDING',
                    })),
                    skipDuplicates: true,
                })

                return assignment
            })
        )

        return { baseShift, assignments }
    })

    return result
}

// function toShiftDate(date: Date): Date {
//   const d = new Date(date)
//   d.setUTCHours(12, 0, 0, 0) // noon UTC, safe from timezone drift
//   return d
// }


function resolveShiftDates({
    startDate,
    endDate,
    isWeekly,
    repeatsOn,
}: {
    startDate: Date
    endDate?: Maybe<Date>
    isWeekly: boolean
    repeatsOn?: string[]
}): Date[] {

    // not repeating — just return the startDate as a single shift
    if (!isWeekly || repeatsOn?.length === 0) {
        return [startDate]
    }

    const targetDays = repeatsOn!.map((day) => DAY_MAP[day.toUpperCase()])

    // get every day between startDate and endDate
    const allDays = eachDayOfInterval({ start: startDate, end: endDate! })

    // filter to only the days that match repeatsOn
    return allDays.filter((day) => targetDays.includes(getDay(day)))
}




// function resolveShiftDates({
//   startDate,
//   endDate,
//   isWeekly,
//   repeatsOn,
// //   timezone,
// }: {
//   startDate: Date
//   endDate: Date
//   isWeekly: boolean
//   repeatsOn: string[]
// //   timezone: string
// }): Date[] {

//   if (!isWeekly || repeatsOn.length === 0) {
//     return [startDate]
//   }

//   const targetDays = repeatsOn.map((day) => DAY_MAP[day.toUpperCase()])

//   // build the interval in the given timezone
//   const start = DateTime.fromJSDate(startDate, { zone: timezone }).startOf('day')
//   const end = DateTime.fromJSDate(endDate, { zone: timezone }).endOf('day')

//   const dates: Date[] = []
//   let current = start

//   while (current <= end) {
//     // luxon weekday: 1=Monday ... 7=Sunday, so we convert to match our 0=Sunday map
//     const jsDay = current.weekday === 7 ? 0 : current.weekday
//     if (targetDays.includes(jsDay)) {
//       // convert back to UTC Date for Prisma
//       dates.push(current.toUTC().toJSDate())
//     }
//     current = current.plus({ days: 1 })
//   }

//   return dates
// }