import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ApiKey {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    key: string;

    @Column()
    uuid: string;

    @ManyToOne(type => User, (user) => user.apiKeys)
    user: User;

    // We could add more columns for mapping an API key to specific permissions or scopes.
}
