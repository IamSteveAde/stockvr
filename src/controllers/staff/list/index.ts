import { InternalError } from "../../../helpers/errorHandler/errorHandler";
import { success } from "../../../helpers/errorHandler/statusCodes";
import { getBusinessIdFromRequest, getProfileUidFromRequest, validateDTO } from "../../../helpers/util";
import { listStaff, listStaffDao, ListStaffDTO } from "./util";

export async function ListStaffController(req: any, res: any, next: any) {
    try {
        const business = getBusinessIdFromRequest(req);
        const dto = await validateDTO(ListStaffDTO,{ ...req.query, businessUid: business.busId });

        const staffList = await listStaff(dto);

        const staffData = listStaffDao(staffList);

        // console.log(staffData)
        success(res, staffData , "Staff members retrieved successfully");
    } catch (error) {
        // console.error("Error in ListStaffController:", error);
        next(new InternalError(error));
    }
}