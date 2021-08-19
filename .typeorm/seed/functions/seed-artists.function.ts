import { LinqRepository } from "../../../src/repository/LinqRepository";
import { Artist } from "../../../test/entities/artist.entity";

export async function seedArtists(): Promise<void> {
    console.log("Seeding artists.");

    const artistRepository = new LinqRepository(Artist);

    const artists: Artist[] = [
        {
            id: 1,
            name: "Artist One"
        },
        {
            id: 2,
            name: "Artist Two"
        },
        {
            id: 3,
            name: "Artist Three"
        }
    ];

    await artistRepository.typeormRepository.insert(artists);

    console.log("Done seeding artists.");
}
