import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export interface IQueryBuilderPart<T extends { id: number }> {
    queryAction: (...params: any[]) => SelectQueryBuilder<T>;
    queryParams: [string] | [string, ObjectLiteral] | [Function, string, boolean] | [number];
}