import { Entity, OneToMany, PrimaryColumn } from "typeorm";
import { UserProfileAttribute } from "./user-profile-attribute.entity";

@Entity()
export class User {
    @PrimaryColumn()
    public id: number;

    @OneToMany(() => UserProfileAttribute, upa => upa.user)
    public profileAttributes?: UserProfileAttribute[];
}
