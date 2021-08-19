import { LinqRepository } from "../../../src/repository/LinqRepository";
import { User } from "../../../test/entities/user.entity";

export async function seedUsers(): Promise<void> {
    console.log("Seeding users.");

    const userRepository = new LinqRepository(User);

    const users: User[] = [
        {
            id: 1
        }
    ];

    await userRepository.typeormRepository.insert(users);

    console.log("Done seeding users.");
}
