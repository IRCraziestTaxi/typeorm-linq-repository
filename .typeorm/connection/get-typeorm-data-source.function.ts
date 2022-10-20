import { DataSource } from "typeorm";
import { dataSourceOptions } from "./get-typeorm-data-source.config";

export async function getTypeormDataSource(): Promise<DataSource> {
    const dataSource = new DataSource(dataSourceOptions);
    await dataSource.initialize();

    return dataSource;
}
