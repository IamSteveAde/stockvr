import { object, string, date } from "yup";
import { prisma } from "../../../helpers/db/client";
import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { nanoid } from "nanoid";

export const CreateShiftDTO = object({
    name: string().required("Shift name is required."),
    startTime: string().required("Start time is required."),
    endTime: string().required("End time is required."),
    date: date().required("Date is required.")
});

export type TCreateShiftDTO = typeof CreateShiftDTO.__outputType;

export async function createShift(data: TCreateShiftDTO) {
    try {
        return await prisma.shift.create({
            data: {
                uid: `SHIFT-${nanoid(12)}`,
                name: data.name,
                startTime: data.startTime,
                endTime: data.endTime,
                date: data.date
            }
        });
    } catch (error) {
        throw new InternalError(error, "Failed to create shift.");
    }
}
