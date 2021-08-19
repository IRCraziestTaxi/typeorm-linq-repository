import { LinqRepository } from "../../../src/repository/LinqRepository";
import { Genre } from "../../../test/entities/genre.entity";

export async function seedGenres(): Promise<void> {
    console.log("Seeding genres.");

    const genreRepository = new LinqRepository(Genre);

    const genres: Genre[] = [
        {
            id: 1,
            name: "Rock"
        },
        {
            id: 2,
            name: "Hip Hop"
        },
        {
            id: 3,
            name: "Pop"
        }
    ];

    await genreRepository.typeormRepository.insert(genres);

    console.log("Done seeding genres.");
}
