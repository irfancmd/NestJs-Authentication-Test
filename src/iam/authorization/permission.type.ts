import { CoffeesPermission } from "src/coffees/coffees.permission";

export const Permission = {
    ...CoffeesPermission,
    // Other permissions will go here as well
}

// If we have other permissions, we can add them as union.
export type PermissionType = CoffeesPermission;  // | <other_permission_enums>