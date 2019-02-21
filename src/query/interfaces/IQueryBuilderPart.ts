import { SelectQueryBuilder } from "typeorm";
import { EntityBase } from "../../types/EntityBase";

/**
 * Represents a part of a TypeORM SelectQueryBuilder of type T.
 */
export interface IQueryBuilderPart<T extends EntityBase> {
    queryParams: any[];
    queryAction(...params: any[]): SelectQueryBuilder<T>;
}
