import { LinqRepository } from "../../../src/repository/LinqRepository";
import { UserProfileAttribute } from "../../../test/entities/user-profile-attribute.entity";

export async function seedUserProfileAttributes(): Promise<void> {
    console.log("Seeding user profile attributes.");

    const userProfileAttributeRepository = new LinqRepository(UserProfileAttribute);

    const userProfileAttributes: UserProfileAttribute[] = [
        {
            genreId: 3,
            id: 1,
            userId: 1
        }
    ];

    await userProfileAttributeRepository.typeormRepository.insert(userProfileAttributes);

    console.log("Done seeding user profile attributes.");
}
