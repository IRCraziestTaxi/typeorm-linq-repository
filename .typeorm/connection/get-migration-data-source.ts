import { DataSource } from "typeorm";
import { dataSourceOptions } from "./get-typeorm-data-source.config";

const dataSource = new DataSource(dataSourceOptions);
dataSource.initialize();

export default dataSource;
