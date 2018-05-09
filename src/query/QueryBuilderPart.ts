import { EntityBase } from "../types/EntityBase";
import { IQueryBuilderPart } from './interfaces/IQueryBuilderPart';
import { SelectQueryBuilder } from "typeorm";

export class QueryBuilderPart<T extends EntityBase> implements IQueryBuilderPart<T> {
    private _queryAction: (...params: any[]) => SelectQueryBuilder<T>;
    private _queryParams: any[];

    public constructor(queryAction: (...params: any[]) => SelectQueryBuilder<T>, queryParams: any[]) {
        this._queryAction = queryAction;
        this._queryParams = queryParams;
    }

    public get queryAction(): (...params: any[]) => SelectQueryBuilder<T> {
        return this._queryAction;
    }

    public get queryParams(): any[] {
        return this._queryParams;
    }
}