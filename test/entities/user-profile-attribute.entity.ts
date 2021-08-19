import { nameof } from "ts-simple-nameof";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Genre } from "./genre.entity";
import { User } from "./user.entity";

@Entity()
export class UserProfileAttribute {
    @ManyToOne(() => Genre)
    @JoinColumn({ name: nameof<UserProfileAttribute>(upa => upa.genreId) })
    public genre?: Genre;

    @Column({ nullable: false })
    public genreId: number;

    @PrimaryColumn()
    public id: number;

    @ManyToOne(() => User, u => u.profileAttributes)
    @JoinColumn({ name: nameof<UserProfileAttribute>(upa => upa.userId) })
    public user?: User;

    @Column({ nullable: false })
    public userId: number;
}
