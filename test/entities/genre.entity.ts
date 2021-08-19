import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class Genre {
    @PrimaryColumn()
    public id: number;

    @Column({ length: 50, nullable: false })
    public name: string;
}
