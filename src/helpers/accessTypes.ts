export const ACCESS_TYPES = {
    owner: "Owner",
    manager: "Manager",
    staff: "Staff"
}

export const PERMISSIONS = {
    owner: ["bill", "reports", "settings", "users", "shifts"],
    manager: ["staff", "shifts", "reports"],
    staff: ["stock", "shifts:view"]

}