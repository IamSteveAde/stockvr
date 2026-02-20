import { object, string, date, boolean, array } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { nanoid } from "nanoid";

export const CreateShiftDTO = object({
    name: string().required("Shift name is required."),
    startTime: string().required("Start time is required."),
    endTime: string().required("End time is required."),
    startDate: date().required("Shift start date is required."),
    endDate: date().notRequired(),
    businesUid: string().required("businessUid required"),
    isWeekly: boolean().default(false),
    repeatsOn: array(
        string().oneOf(["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"])
    ).default([]),
    staffInChargeId: string().required("Provide staff in charge to proceed."),
});

export const ShiftStaffsDTO = object(
    {
        staffIds: array(string().required("Staffs required under shift.")).required("Select staff members to attach to shift.")
    }
)

export type TCreateShiftDTO = typeof CreateShiftDTO.__outputType;
export type TShiftStaffsDTO = typeof ShiftStaffsDTO.__outputType;

// not doing date checks because there could be a reason for creating 2 different shifts  occuring at the same time.

export async function createBaseShift(dto: TCreateShiftDTO) {
    try {
        return await prisma.baseShift.create({
            data: {
                uid: `BSH-${nanoid(12)}`,
                ...dto

            }
        });
    } catch (error) {

        console.log("shift create ==> ", error)
        throw new InternalError(error, "Failed to create shift.");
    }
}

export async function createShiftAssignments(baseShiftRecord: Awaited<ReturnType<typeof createBaseShift>>, staffIdDto: TShiftStaffsDTO) {
    const assignments = staffIdDto.staffIds.map(function (uid) {
        return {
            uid: "BSA-"+nanoid(12),
            businessUid: baseShiftRecord.businessUid,
            baseShiftUid: baseShiftRecord.uid,
            staffUid: uid,
            assignedAt: baseShiftRecord.createdAt
        }
    })


    await prisma.shiftAssignment.createMany(
        {
            data: assignments
        }
    )

    return assignments
}


// work on this logic to properly handle multiple times and multiple users properly
export async function createGranularShift(baseShiftRecord: Awaited<ReturnType<typeof createBaseShift>>, assignments: Awaited<ReturnType<typeof createShiftAssignments>>) {
    const shifts =  assignments.map(function (assignment){
        return {
            uid: "SHF-"+nanoid(12),
            baseShiftUid: baseShiftRecord.uid,
            businessUid: baseShiftRecord.businessUid,
            staffUid: assignment.staffUid,
            shiftAssignmentUid: assignment.uid,
            date
        }
    })

    await prisma.shift.createMany()
}