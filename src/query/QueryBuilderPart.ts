import { IQueryBuilderPart } from './interfaces/IQueryBuilderPart';
import { /*ObjectLiteral, */SelectQueryBuilder } from "typeorm";

export class QueryBuilderPart<T extends { id: number }> implements IQueryBuilderPart<T> {
    private _queryAction: (...params: any[]) => SelectQueryBuilder<T>;
    private _queryParams: [string] /*| [string, ObjectLiteral]*/ | [Function, string, "true"] | [number];

    public constructor(queryAction: (...params: any[]) => SelectQueryBuilder<T>, queryParams: [string] /*| [string, ObjectLiteral]*/ | [Function, string, "true"] | [number]) {
        this._queryAction = queryAction;
        this._queryParams = queryParams;
    }

    public get queryAction(): (...params: any[]) => SelectQueryBuilder<T> {
        return this._queryAction;
    }

    public get queryParams(): [string] /*| [string, ObjectLiteral]*/ | [Function, string, "true"] | [number] {
        return this._queryParams;
    }
}