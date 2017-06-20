import { QueryBuilder, ObjectLiteral } from "typeorm";

export interface IQueryBuilderPart<T extends { id: number }> {
    queryAction: (...params: any[]) => QueryBuilder<T>;
    queryParams: [string] | [string, ObjectLiteral] | [number];
}