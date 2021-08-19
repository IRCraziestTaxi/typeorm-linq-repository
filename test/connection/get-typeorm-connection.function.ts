import { Connection, createConnection, getConnection } from "typeorm";

export async function getTypeormConnection(): Promise<Connection> {
    const connection = await createConnection();

    return connection;
}
