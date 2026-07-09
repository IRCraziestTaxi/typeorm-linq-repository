import { DataSource } from "typeorm";
import { LinqRepository } from "../../../src/repository/LinqRepository";
import { User } from "../../../test/entities/user.entity";

export async function seedUsers(dataSource: DataSource): Promise<void> {
    console.log("Seeding users.");

    const userRepository = new LinqRepository(dataSource, User);

    const users: User[] = [
        {
            id: 1
        }
    ];

    await userRepository.typeormRepository.upsert(users, ["id"]);

    console.log("Done seeding users.");
}
