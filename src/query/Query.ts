import { QueryWhereType } from "../enums/QueryWhereType";
import { IComparableQuery } from "./interfaces/IComparableQuery";
import { IFromQuery } from "./interfaces/IFromQuery";
import { IJoinedComparableQuery } from "./interfaces/IJoinedComparableQuery";
import { IQuery } from "./interfaces/IQuery";
import { IQueryBuilderPart } from "./interfaces/IQueryBuilderPart";
import { QueryBuilderPart } from "./QueryBuilderPart";
import { nameof } from "ts-simple-nameof";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export class Query<T extends { id: number }, R = T | T[], P = T> implements IQuery<T, R, P>, IComparableQuery<T, R, P>, IJoinedComparableQuery<T, R, P>, IFromQuery<T, R, P> {
    private readonly OPERATOR_EQUAL: string = "=";
    private readonly OPERATOR_GREATER: string = ">";
    private readonly OPERATOR_GREATER_EQUAL: string = ">=";
    private readonly OPERATOR_LESS: string = "<";
    private readonly OPERATOR_LESS_EQUAL: string = "<=";
    private readonly OPERATOR_NOT_EQUAL: string = "!=";

    private _getAction: () => Promise<R>;
    private _includeAliasHistory: string[];
    private _initialAlias: string;
    private _lastAlias: string;
    private _query: SelectQueryBuilder<T>;
    private _queryParts: IQueryBuilderPart<T>[];
    private _queryWhereType: QueryWhereType;

    /**
     * Constructs a Query wrapper.
     * @param queryBuilder The QueryBuilder to wrap.
     * @param getAction Either queryBuilder.getOne or queryBuilder.getMany.
     */
    constructor(queryBuilder: SelectQueryBuilder<T>, getAction: () => Promise<R>) {
        this._getAction = getAction;
        this._includeAliasHistory = [];
        this._initialAlias = queryBuilder.alias;
        this._lastAlias = this._initialAlias;
        this._query = queryBuilder;
        this._queryParts = [];
        this._queryWhereType = QueryWhereType.Normal;
    }

    public get getAction(): () => Promise<R> {
        return this._getAction;
    }

    public get query(): SelectQueryBuilder<T> {
        return this._query;
    }

    public get queryParts(): IQueryBuilderPart<T>[] {
        return this._queryParts;
    }

    public and<S extends Object>(propertySelector: (obj: P) => S, subPropertySelector?: (obj: S) => any): IComparableQuery<T, R, P> {
        let whereProperty: string = nameof<P>(propertySelector);
        if (this._queryWhereType === QueryWhereType.Include) {
            this.addJoinCondition(whereProperty, "AND");
        }
        else if (subPropertySelector) {
            let whereConditionProperty: string = nameof<S>(subPropertySelector);
            this._queryWhereType = QueryWhereType.InnerJoin;
            this.createJoinCondition(whereProperty, whereConditionProperty);
        }
        else {
            let where: string = `${this._initialAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                this._query.andWhere, [where]
            ));
        }
        return this;
    }

    public beginsWith(value: string): IQuery<T, R, P> {
        return this.completeWhere("LIKE", value, true, true, false);
    }

    public catch(rejected: (error: any) => void | Promise<any> | IQuery<any, any>): Promise<any> {
        return this.toPromise().catch(rejected);
    }

    public contains(value: string): IQuery<T, R, P> {
        return this.completeWhere("LIKE", value, true, true, true);
    }

    public endsWith(value: string): IQuery<T, R, P> {
        return this.completeWhere("LIKE", value, true, false, true);
    }

    public equal(value: string | number | boolean): IQuery<T, R, P> {
        return this.completeWhere(this.OPERATOR_EQUAL, value);
    }

    public equalJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(this.OPERATOR_EQUAL, selector);
    }

    // TODO: Try removing this any. If not possible, comment above this method stating why any is necessary.
    public from<F extends { id: number }>(foreignEntity: { new (...params: any[]): F; }): IFromQuery<T, R, F> | IComparableQuery<T, R, F> | any {
        return this.joinForeignEntity<F>(foreignEntity);
    }

    public greaterThan(value: number): IQuery<T, R, P> {
        return this.completeWhere(this.OPERATOR_GREATER, value);
    }

    public greaterThanJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(this.OPERATOR_GREATER, selector);
    }

    public greaterThanOrEqual(value: number): IQuery<T, R, P> {
        return this.completeWhere(this.OPERATOR_GREATER_EQUAL, value);
    }

    public greaterThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(this.OPERATOR_GREATER_EQUAL, selector);
    }

    public in(include: string[] | number[]): IQuery<T, R, P> {
        return this.completeWhere("IN", `(${include.join(", ")})`);
    }

    public include<S>(propertySelector: (obj: T) => S | S[]): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._initialAlias);
    }

    public includeWhere<S extends Object>(propertySelector: (obj: T) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        let includeProperty: string = nameof<T>(propertySelector);
        let includeConditionProperty: string = nameof<S>(subPropertySelector);
        this.createJoinCondition(includeProperty, includeConditionProperty);
        this._queryWhereType = QueryWhereType.Include;
        return <IComparableQuery<T, R, S>><any>this;
    }

    public inSelected<S extends Object>(propertySelector: (obj: T) => any, innerQuery: IQuery<T, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(propertySelector, innerQuery, selectFromInnerQuery, "IN");
    }

    public isFalse(): IQuery<T, R, P> {
        this.completeWhere("=", false);
        return this;
    }

    public isTrue(): IQuery<T, R, P> {
        this.completeWhere("=", true);
        return this;
    }

    public join<S extends Object>(propertySelector: (obj: T) => S | S[]): IQuery<T, R, S> | IComparableQuery<T, R, S> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._initialAlias);
    }

    public joinWhere<S extends Object>(propertySelector: (obj: T) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        let includeProperty: string = nameof<T>(propertySelector);
        let includeConditionProperty: string = nameof<S>(subPropertySelector);
        this.createJoinCondition(includeProperty, includeConditionProperty);
        return <IComparableQuery<T, R, S>><any>this;
    }

    public lessThan(value: number): IQuery<T, R, P> {
        return this.completeWhere(this.OPERATOR_LESS, value);
    }

    public lessThanJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(this.OPERATOR_LESS, selector);
    }

    public lessThanOrEqual(value: number): IQuery<T, R, P> {
        return this.completeWhere(this.OPERATOR_LESS_EQUAL, value);
    }

    public lessThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(this.OPERATOR_LESS_EQUAL, selector);
    }

    public notEqual(value: string | number | boolean): IQuery<T, R, P> {
        return this.completeWhere(this.OPERATOR_NOT_EQUAL, value);
    }

    public notEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(this.OPERATOR_NOT_EQUAL, selector);
    }

    public notIn(exclude: string [] | number[]): IQuery<T, R, P> {
        return this.completeWhere("NOT IN", `(${exclude.join(", ")})`);
    }

    public notInSelected<S extends Object>(propertySelector: (obj: T) => any, innerQuery: IQuery<T, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(propertySelector, innerQuery, selectFromInnerQuery, "NOT IN");
    }

    public notNull(): IQuery<T, R, P> {
        return this.completeWhere("IS", "NOT NULL", false);
    }

    public null(): IQuery<T, R, P> {
        return this.completeWhere("IS", "NULL", false);
    }

    public or<S extends Object>(propertySelector: (obj: P) => S, subPropertySelector?: (obj: S) => any): IComparableQuery<T, R, P> {
        let whereProperty: string = nameof<P>(propertySelector);
        if (this._queryWhereType === QueryWhereType.Include) {
            this.addJoinCondition(whereProperty, "OR");
        }
        else if (subPropertySelector) {
            let whereConditionProperty: string = nameof<S>(subPropertySelector);
            this._queryWhereType = QueryWhereType.InnerJoin;
            this.createJoinCondition(whereProperty, whereConditionProperty);
        }
        else {
            let where: string = `${this._initialAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                this._query.orWhere, [where]
            ));
        }
        return this;
    }

    public orderBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.orderBy, [orderProperty, "ASC"]
        ));
        return this;
    }

    public orderByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.orderBy, [orderProperty, "DESC"]
        ));
        return this;
    }

    public skip(skip: number): IQuery<T, R, P> {
        if (skip > 0) {
            this._queryParts.push(new QueryBuilderPart(
                this._query.setFirstResult, [skip]
            ));
        }
        return this;
    }

    public take(limit: number): IQuery<T, R, P> {
        if (limit > 0) {
            this._queryParts.push(new QueryBuilderPart(
                this._query.setMaxResults, [limit]
            ));
        }
        return this;
    }

    public then(resolved: (results: R) => void | Promise<any>): Promise<any> {
        return this.toPromise().then(resolved);
    }

    public thenBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.addOrderBy, [orderProperty, "ASC"]
        ));
        return this;
    }

    public thenByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        let propertyName: string = nameof<P>(propertySelector);
        let orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.addOrderBy, [orderProperty, "DESC"]
        ));
        return this;
    }

    public thenInclude<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._lastAlias);
    }

    public thenIncludeWhere<S extends Object>(propertySelector: (obj: P) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        let includeProperty: string = nameof<P>(propertySelector);
        let includeConditionProperty: string = nameof<S>(subPropertySelector);
        this.createJoinCondition(includeProperty, includeConditionProperty);
        this._queryWhereType = QueryWhereType.Include;
        return <IComparableQuery<T, R, S>><any>this;
    }

    public thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S> | IComparableQuery<T, R, P> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._lastAlias);
    }

    public thenJoinWhere<S extends Object>(propertySelector: (obj: P) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        let includeProperty: string = nameof<P>(propertySelector);
        let includeConditionProperty: string = nameof<S>(subPropertySelector);
        this.createJoinCondition(includeProperty, includeConditionProperty);
        return <IComparableQuery<T, R, S>><any>this;
    }

    public toPromise(): Promise<R> {
        return this._getAction.call(this.buildQuery(this));
    }

    public usingBaseType(): IQuery<T, R, T> {
        this._lastAlias = this._initialAlias;
        return <IQuery<T, R, T>><any>this;
    }

    public where<S extends Object, F = T | P>(propertySelector: (obj: F) => S, subPropertySelector?: (obj: S) => any): IComparableQuery<T, R, T> | IComparableQuery<T, R, P> | any {
        let whereProperty: string = nameof<F>(propertySelector);
        if (subPropertySelector) {
            let whereConditionProperty: string = nameof<S>(subPropertySelector);
            this._queryWhereType = QueryWhereType.InnerJoin;
            this.createJoinCondition(whereProperty, whereConditionProperty);
        }
        else {
            let where: string = `${this._initialAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                this._query.where, [where]
            ));
            this._queryWhereType = QueryWhereType.Normal;
        }
        return <IComparableQuery<T, R, T>><any>this;
    }

    private addJoinCondition(whereProperty: string, condition: "AND" | "OR"): void {
        // [QueryBuilder.leftJoinAndSelect, ["alias.includedProperty", "includedProperty", "includedProperty.property = 'something'"]]
        let part: IQueryBuilderPart<T> = this._queryParts.pop();
        // "includedProperty.property = 'something'"
        let joinCondition: string = (<[string]>part.queryParams).pop();
        // "includedProperty"
        let joinAlias: string = (<[string]>part.queryParams).pop();
        // "otherProperty"
        // "includedProperty.property = 'something' <AND/OR> includedProperty.otherProperty" (to be finished in completeWhere())
        joinCondition += ` ${condition} ${joinAlias}.${whereProperty}`;
        (<[string]>part.queryParams).push(joinAlias);
        (<[string]>part.queryParams).push(joinCondition);
        this._queryParts.push(part);
    }

    private buildQuery(query: IQuery<T, R, any>): SelectQueryBuilder<T> {
        // Unpack and apply the QueryBuilder parts.
        if (query.queryParts.length) {
            for (let queryPart of query.queryParts) {
                queryPart.queryAction.call(query, ...queryPart.queryParams);
            }
        }
        return query.query;
    }

    private completeJoinedWhere(operator: string, selector: (obj: P) => any): IQuery<T, R, P> {
        this._queryWhereType = QueryWhereType.InnerJoin;
        let selectedProperty: string = nameof<P>(selector);
        let compareValue: string = `${this._lastAlias}.${selectedProperty}`;
        return this.completeWhere(operator, compareValue);
    }

    private completeWhere(operator: string, value: string | number | boolean, quoteString: boolean = true, beginsWith: boolean = false, endsWith: boolean = false): IQuery<T, R, P> {
        if (beginsWith) {
            value += "%";
        }
        if (endsWith) {
            value = `%${value}`;
        }
        // In case of a from or join within a "where", must find the last "where" in the query parts.
        let nonWheres: IQueryBuilderPart<T>[] = [];
        let wherePart: IQueryBuilderPart<T> = null;
        while (this._queryParts.length && !wherePart) {
            let part = this._queryParts.pop();
            if (
                part.queryAction == this._query.where ||
                part.queryAction == this._query.andWhere ||
                part.queryAction == this._query.orWhere
            ) {
                wherePart = part;
            }
            else {
                nonWheres.unshift(part);
            }
        }
        this._queryParts.push(...nonWheres);
        if (this._queryWhereType !== QueryWhereType.Normal) {
            if (typeof value === "string" && quoteString) {
                value = value.replace(/'/g, "''");
                value = `'${value}'`;
            }
            // [QueryBuilder.leftJoinAndSelect, ["alias.includedProperty", "includedProperty", "includedProperty.property"]]
            let part: IQueryBuilderPart<T> = wherePart;
            // "includedProperty.property"
            let joinCondition: string = (<[string]>part.queryParams).pop();
            // "includedProperty.property = 'something'"
            joinCondition += ` ${operator} ${value}`;
            (<[string]>part.queryParams).push(joinCondition);
            this._queryParts.push(part);
        }
        else {
            // [QueryBuilder.<where | andWhere | orWhere>, ["alias.property"]]
            let part: IQueryBuilderPart<T> = wherePart;
            // "alias.property"
            let where: string = (<[string]>part.queryParams).pop();
            where += ` ${operator} :value`;
            let whereParam: ObjectLiteral = { value: value };
            (<[string, ObjectLiteral]>part.queryParams).push(where);
            (<[string, ObjectLiteral]>part.queryParams).push(whereParam);
            this._queryParts.push(part);
        }
        return this;
    }

    private createJoinCondition(joinProperty: string, joinConditionProperty: string): void {
        // alias.property
        let joinPropertyFull: string = `${this._lastAlias}.${joinProperty}`;
        // alias_property
        let joinAlias: string = `${this._lastAlias}_${joinProperty}`;
        this._lastAlias = joinAlias;
        // alias_property.conditionProperty
        let joinCondition: string = `${joinAlias}.${joinConditionProperty}`;

        let joinFunction: (property: string, aliasName: string, condition?: string) => SelectQueryBuilder<T> = null;
        if (this._queryWhereType === QueryWhereType.Include) {
            joinFunction = this._query.leftJoinAndSelect;
        }
        else {
            joinFunction = this._query.innerJoin;
        }

        this._queryParts.push(new QueryBuilderPart(
            joinFunction, [joinPropertyFull, joinAlias, joinCondition]
        ));
    }

    private joinForeignEntity<F extends Object>(foreignEntity: { new (...params: any[]): F; }): IQuery<T, R, F> | IComparableQuery<T, R, F> {
        let entityName: string = nameof(foreignEntity);
        let resultAlias: string = entityName;
        this._lastAlias = resultAlias;
        // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
        // Only execute the include if it has not been previously executed.
        if (!(this._includeAliasHistory.find(a => a === resultAlias))) {
            this._includeAliasHistory.push(resultAlias);
            this._queryParts.push(new QueryBuilderPart(
                this._query.innerJoin, [foreignEntity, resultAlias, true]
            ));
        }
        return <IQuery<T, R, F> | IComparableQuery<T, R, F>><any>this;
    }

    private includeOrExcludeFromInnerQuery<S extends Object>(propertySelector: (obj: T) => any, innerQuery: IQuery<T, R, S>, selectFromInnerQuery: (obj: S) => any, operator: string): IQuery<T, R, P> {
        let selectedProperty: string = nameof<T>(propertySelector);
        let selectedFromAlias: string = `${this._initialAlias}.${selectedProperty}`;
        let includeProperty: string = nameof<S>(selectFromInnerQuery);
        innerQuery.queryParts.unshift(new QueryBuilderPart(
            innerQuery.query.select, [includeProperty]
        ));
        let query: string = this.buildQuery(innerQuery).getQuery();
        this._queryParts.push(new QueryBuilderPart(
            this._query.where, [`${selectedFromAlias} ${operator} (${query})`]
        ));
        return this;
    }

    private includePropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string): IQuery<T, R, S> {
        return this.joinOrIncludePropertyUsingAlias(propertySelector, queryAlias, this._query.leftJoinAndSelect);
    }

    private joinOrIncludePropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string, queryAction: (...params: any[]) => SelectQueryBuilder<T>): IQuery<T, R, S> {
        let propertyName: string = nameof<P>(propertySelector);
        let resultAlias: string = `${queryAlias}_${propertyName}`;
        this._lastAlias = resultAlias;
        // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
        // Only execute the include if it has not been previously executed.
        if (!(this._includeAliasHistory.find(a => a === resultAlias))) {
            this._includeAliasHistory.push(resultAlias);
            let queryProperty: string = `${queryAlias}.${propertyName}`;
            this._queryParts.push(new QueryBuilderPart(
                queryAction, [queryProperty, resultAlias]
            ));
        }
        return <IQuery<T, R, S>><any>this;
    }

    private joinPropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string): IQuery<T, R, S> {
        return this.joinOrIncludePropertyUsingAlias(propertySelector, queryAlias, this._query.innerJoin);
    }
}