import { EntityBase } from "../../types/EntityBase";
import { /*ObjectLiteral,*/ SelectQueryBuilder } from "typeorm";

/**
 * Represents a part of a TypeORM SelectQueryBuilder of type T.
 */
export interface IQueryBuilderPart<T extends EntityBase> {
    queryAction: (...params: any[]) => SelectQueryBuilder<T>;
    queryParams: any[];
}