import { Column, Entity, JoinTable, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "../enums/role.enum";
import { Permission, PermissionType } from "src/iam/authorization/permission.type";
import { ApiKey } from "../api-keys/entities/api-key.entity/api-key.entity";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    // Users who use google authentication won't need a password. Hence it's nullable.
    @Column({ nullable: true })
    password: string;

    @Column({ enum: Role, default: Role.Regular })
    role: Role;

    @JoinTable()
    @OneToMany((type) => ApiKey, (apiKey) => apiKey.user)
    apiKeys: ApiKey[];

    /* Typically we implement either role wise or claim wise authorization. Since
     * we already have role wise authentication, having separate permission don't make
     * sense. The permission field for allowing claim wise authorization is
     * provided for demonstration purpose only.
     */

    @Column({ enum: Permission, default: [], type: 'json' })
    permissions: PermissionType[];

    @Column({ nullable: true })
    googleId: string;
}
