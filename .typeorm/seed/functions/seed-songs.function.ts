import { LinqRepository } from "../../../src/repository/LinqRepository";
import { Song } from "../../../test/entities/song.entity";

export async function seedSongs(): Promise<void> {
    console.log("Seeding songs.");

    const songRepository = new LinqRepository(Song);

    const songs: Song[] = [
        {
            artistId: 1,
            genreId: 1,
            id: 1,
            name: "Rock Song"
        },
        {
            artistId: 1,
            genreId: 2,
            id: 2,
            name: "Hip Hop Song"
        },
        {
            artistId: 1,
            genreId: 3,
            id: 3,
            name: "Pop Song"
        },
        {
            artistId: 2,
            genreId: 1,
            id: 4,
            name: "Rock Song"
        },
        {
            artistId: 2,
            genreId: 2,
            id: 5,
            name: "Hip Hop Song"
        },
        {
            artistId: 3,
            genreId: 1,
            id: 6,
            name: "Rock Song"
        },
        {
            artistId: 3,
            genreId: 3,
            id: 7,
            name: "Pop Song"
        }
    ];

    await songRepository.typeormRepository.insert(songs);

    console.log("Done seeding songs.");
}
