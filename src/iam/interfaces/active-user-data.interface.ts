import { Role } from "src/users/enums/role.enum";
import { PermissionType } from "../authorization/permission.type";

export interface ActiveUserData {
    sub: number;
    email: string;
    role: Role;

    /* Typically we implement either role wise or claim wise authorization. Since
     * we already have role wise authentication, having separate permission don't make
     * sense. The permission field for allowing claim wise authorization is
     * provided for demonstration purpose only.
     */
    permissions: PermissionType[];
}