import { nameof } from "ts-simple-nameof";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from "typeorm";
import { Artist } from "./artist.entity";
import { Genre } from "./genre.entity";

@Entity()
export class Song {
    @ManyToOne(() => Artist, a => a.songs)
    @JoinColumn({ name: nameof<Song>(s => s.artistId) })
    public artist?: Artist;

    @Column({ nullable: false })
    public artistId: number;

    @ManyToOne(() => Genre)
    @JoinColumn({ name: nameof<Song>(s => s.genreId) })
    public genre?: Genre;

    @Column({ nullable: false })
    public genreId: number;

    @PrimaryColumn()
    public id: number;

    @Column({ length: 100, nullable: false })
    public name: string;
}
