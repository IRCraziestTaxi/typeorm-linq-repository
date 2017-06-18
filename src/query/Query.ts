import { nameof } from "ts-simple-nameof";
import { ObjectLiteral, QueryBuilder } from "typeorm";
import { IQuery } from "./interfaces/IQuery";
import { IComparableQuery } from './interfaces/IComparableQuery';

export class Query<T extends { id: number }, R = T | T[], P = T> implements IQuery<T, R, P>, IComparableQuery<T, R, P> {
    private _customWhereAlias: string;
    private _getAction: () => Promise<R>;
    private _includeAliasHistory: string[];
    private _includeWhere: boolean;
    private _includeWhereProperty: string;
    private _initialAlias: string;
    private _lastAlias: string;
    private _query: QueryBuilder<T>;
    private _whereProperty: string;
    private _whereAction: (where: string, parameters?: ObjectLiteral) => QueryBuilder<T>;

    /**
     * Constructs a Query wrapper.
     * @param queryBuilder The QueryBuilder to wrap.
     * @param getAction Either queryBuilder.getOne or queryBuilder.getMany.
     */
    constructor(queryBuilder: QueryBuilder<T>, getAction: () => Promise<R>) {
        this._customWhereAlias = "";
        this._getAction = getAction;
        this._includeAliasHistory = [];
        this._includeWhere = false;
        this._includeWhereProperty = "";
        this._initialAlias = queryBuilder.alias;
        this._lastAlias = this._initialAlias;
        this._query = queryBuilder;
        this._whereAction = null;
        this._whereProperty = "";
    }

    public and(propertySelector: (obj: T) => any, alias?: string): IComparableQuery<T, R, T> {
        this._whereProperty = nameof<T>(propertySelector);
        this._whereAction = this._query.andWhere;
        this._customWhereAlias = alias || "";
        // Use <T, R, T | P> as opposed to <T, R, T> to appease the compiler.
        return <IComparableQuery<T, R, T | P>>this;
    }

    public catch(rejected: (error: any) => void | Promise<any> | IQuery<any, any>): Promise<any> {
        return this.toPromise().catch(rejected);
    }

    public equal(value: string | number | boolean): IQuery<T, R, P> {
        return this.performWhere("=", value);
    }

    public greaterThan(value: number): IQuery<T, R, P> {
        return this.performWhere(">", value);
    }

    public greaterThanOrEqual(value: number): IQuery<T, R, P> {
        return this.performWhere(">=", value);
    }

    public include<S>(propertySelector: (obj: T) => S | S[], alias?: string): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._initialAlias, alias);
    }

    includeWhere<S extends Object>(propertySelector: (obj: T) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        this._includeWhereProperty = nameof<T>(propertySelector);
        this._whereProperty = nameof<S>(subPropertySelector);
        this._includeWhere = true;
        this._lastAlias = this._initialAlias;
        // Use <T, R, S | P> as opposed to <T, R, S> to appease the compiler.
        return <IComparableQuery<T, R, S | P>>this;
    }

    public isFalse(): IQuery<T, R, P> {
        this._query = this._whereAction.call(this._query, `${this.whereProperty} = false`);
        return this;
    }

    public isTrue(): IQuery<T, R, P> {
        this._query = this._whereAction.call(this._query, `${this.whereProperty} = true`);
        return this;
    }

    public lessThan(value: number): IQuery<T, R, P> {
        return this.performWhere("<", value);
    }

    public lessThanOrEqual(value: number): IQuery<T, R, P> {
        return this.performWhere("<=", value);
    }

    public notEqual(value: string | number | boolean): IQuery<T, R, P> {
        return this.performWhere("!=", value);
    }

    public or(propertySelector: (obj: T) => any, alias?: string): IComparableQuery<T, R, T> {
        this._whereProperty = nameof<T>(propertySelector);
        this._whereAction = this._query.orWhere;
        this._customWhereAlias = alias || "";
        // Use <T, R, T | P> as opposed to <T, R, T> to appease the compiler.
        return <IComparableQuery<T, R, T | P>>this;
    }

    public orderBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._query = this._query.orderBy(orderProperty, "ASC");
        return this;
    }

    public orderByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._query = this._query.orderBy(orderProperty, "DESC");
        return this;
    }

    public skip(skip: number): IQuery<T, R> {
        if (skip > 0) {
            this._query = this._query.setFirstResult(skip);
        }
        return <IQuery<T, R, T | P>>this;
    }

    public take(limit: number): IQuery<T, R> {
        if (limit > 0) {
            this._query = this._query.setMaxResults(limit);
        }
        return <IQuery<T, R, T | P>>this;
    }

    public then(resolved: (results: R) => void | Promise<any> | IQuery<any, any>): Promise<any> {
        return this.toPromise().then(resolved);
    }

    public thenBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._query = this._query.addOrderBy(orderProperty, "ASC");
        return this;
    }

    public thenByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._query = this._query.addOrderBy(orderProperty, "DESC");
        return this;
    }

    public thenInclude<S>(propertySelector: (obj: P) => S | S[], alias?: string): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._lastAlias, alias);
    }

    thenIncludeWhere<S extends Object>(propertySelector: (obj: P) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        this._includeWhereProperty = nameof<P>(propertySelector);
        this._whereProperty = nameof<S>(subPropertySelector);
        this._includeWhere = true;
        // Use <T, R, S | P> as opposed to <T, R, S> to appease the compiler.
        return <IComparableQuery<T, R, S | P>>this;
    }

    public toPromise(): Promise<R> {
        return this._getAction.call(this._query);
    }

    public where(propertySelector: (obj: T) => any, alias?: string): IComparableQuery<T, R, T> {
        this._whereProperty = nameof<T>(propertySelector);
        this._whereAction = this._query.where;
        this._customWhereAlias = alias || "";
        return <IComparableQuery<T, R, T | P>>this;
    }

    private get whereProperty(): string {
        return `${this._customWhereAlias || this._lastAlias}.${this._whereProperty}`;
    }

    private includePropertyUsingAlias<S>(propertySelector: (obj: T | P) => S | S[], queryAlias: string, customAlias?: string): IQuery<T, R, S> {
        let propertyName: string = nameof<P>(propertySelector);
        let resultAlias: string = `${queryAlias}_${propertyName}`;
        this._lastAlias = resultAlias;
        // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
        // Only execute the include if it has not been previously executed.
        if (!(this._includeAliasHistory.find(a => a === resultAlias))) {
            this._includeAliasHistory.push(resultAlias);
            let queryProperty: string = `${queryAlias}.${propertyName}`;
            this._query = this._query.leftJoinAndSelect(queryProperty, customAlias || resultAlias);
        }
        // Use <T, R, S | P> as opposed to <T, R, S> to appease the compiler.
        return <IQuery<T, R, S | P>>this;
    }

    private performWhere(operator: string, value: string | number | boolean): IQuery<T, R, P> {
        if (this._includeWhere) {
            this._includeWhere = false;
            let includeProperty: string = `${this._lastAlias}.${this._includeWhereProperty}`;
            let resultAlias: string = this._lastAlias = this._includeWhereProperty;
            if (typeof value === "string") {
                value = `'${value}'`;
            }
            let joinCondition: string = `${this._includeWhereProperty}.${this._whereProperty} ${operator} ${value}`;
            this._query = this._query.leftJoinAndSelect(includeProperty, resultAlias, joinCondition);
        }
        else {
            let where: string = `${this.whereProperty} ${operator} :value`;
            this._query = this._whereAction.call(this._query, where, { value: value });
        }
        return this;
    }
}