import { Column, Entity, OneToMany, PrimaryColumn } from "typeorm";
import { Song } from "./song.entity";

@Entity()
export class Artist {
    @PrimaryColumn()
    public id: number;

    @Column({ length: 100, nullable: false })
    public name: string;

    @OneToMany(() => Song, a => a.artist)
    public songs?: Song[];
}
