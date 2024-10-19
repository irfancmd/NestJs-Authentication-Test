import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../enums/role.enum";
import { Permission, PermissionType } from "src/iam/authorization/permission.type";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ enum: Role, default: Role.Regular })
    role: Role;

    /* Typically we implement either role wise or claim wise authorization. Since
     * we already have role wise authentication, having separate permission don't make
     * sense. The permission field for allowing claim wise authorization is
     * provided for demonstration purpose only.
     */

    @Column({ enum: Permission, default: [], type: 'json' })
    permissions: PermissionType[];
}
