import { IQueryBuilderPart } from './interfaces/IQueryBuilderPart';
import { QueryBuilder, ObjectLiteral } from "typeorm";

export class QueryBuilderPart<T extends { id: number }> implements IQueryBuilderPart<T> {
    public queryAction: (...params: any[]) => QueryBuilder<T>;
    public queryParams: [string] | [string, ObjectLiteral] | [number];

    constructor(queryAction: (...params: any[]) => QueryBuilder<T>, queryParams: [string] | [string, ObjectLiteral] | [number]) {
        this.queryAction = queryAction;
        this.queryParams = queryParams;
    }
}