import { getTypeormDataSource } from "../../connection/get-typeorm-data-source.function";
import { seedArtists } from "./seed-artists.function";
import { seedGenres } from "./seed-genres.function";
import { seedSongs } from "./seed-songs.function";
import { seedUserProfileAttributes } from "./seed-user-profile-attributes.function";
import { seedUsers } from "./seed-users.function";

export async function main(): Promise<void> {
    console.log("Creating connection.");

    const dataSource = await getTypeormDataSource();

    await seedGenres(dataSource);
    await seedArtists(dataSource);
    await seedSongs(dataSource);
    await seedUsers(dataSource);
    await seedUserProfileAttributes(dataSource);

    console.log("Closing connection.");

    await dataSource.destroy();
}
