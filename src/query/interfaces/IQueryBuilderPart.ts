import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

/**
 * Represents a part of a TypeORM SelectQueryBuilder of type T.
 */
export interface IQueryBuilderPart<T extends { id: number }> {
    queryAction: (...params: any[]) => SelectQueryBuilder<T>;
    queryParams: [string] | [string, ObjectLiteral] | [Function, string, "true"] | [number];
}