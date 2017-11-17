import { IQueryBuilderPart } from './interfaces/IQueryBuilderPart';
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export class QueryBuilderPart<T extends { id: number }> implements IQueryBuilderPart<T> {
    public queryAction: (...params: any[]) => SelectQueryBuilder<T>;
    public queryParams: [string] | [string, ObjectLiteral] | [Function, string, boolean] | [number];

    constructor(queryAction: (...params: any[]) => SelectQueryBuilder<T>, queryParams: [string] | [string, ObjectLiteral] | [Function, string, boolean] | [number]) {
        this.queryAction = queryAction;
        this.queryParams = queryParams;
    }
}