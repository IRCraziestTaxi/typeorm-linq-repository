import { getTypeormConnection } from "../../../test/connection/get-typeorm-connection.function";
import { seedArtists } from "./seed-artists.function";
import { seedGenres } from "./seed-genres.function";
import { seedSongs } from "./seed-songs.function";
import { seedUserProfileAttributes } from "./seed-user-profile-attributes.function";
import { seedUsers } from "./seed-users.function";

export async function main(): Promise<void> {
    console.log("Creating connection.");

    const connection = await getTypeormConnection();

    await seedGenres();
    await seedArtists();
    await seedSongs();
    await seedUsers();
    await seedUserProfileAttributes();

    console.log("Closing connection.");

    await connection.close();
}
