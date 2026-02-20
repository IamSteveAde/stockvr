import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { listStaff, listStaffDao, ListStaffDTO } from "./util";

export async function ListStaffController(req: any, res: any, next: any) {
    try {
        const profileUid = getProfileUidFromRequest(req);
        const dto = await validateDTO(ListStaffDTO,{ ...req.query, profileUid });

        const staffList = await listStaff(dto);

        const staffData = listStaffDao(staffList);
        success(res, staffData , "Staff members retrieved successfully");
    } catch (error) {
        console.error("Error in ListStaffController:", error);
        next(new InternalError(error));
    }
}