import { EntityBase } from "../types/EntityBase";
import { QueryWhereType } from "../enums/QueryWhereType";
import { QueryMode } from "../enums/QueryMode";
import { SqlConstants } from "../constants/SqlConstants";
import { IComparableQuery } from "./interfaces/IComparableQuery";
import { IJoinedComparableQuery } from "./interfaces/IJoinedComparableQuery";
import { IJoinedQuery } from "./interfaces/IJoinedQuery";
import { IQuery } from "./interfaces/IQuery";
import { IQueryBuilderPart } from "./interfaces/IQueryBuilderPart";
import { IQueryInternal } from "./interfaces/IQueryInternal";
import { ISelectQuery } from "./interfaces/ISelectQuery";
import { ISelectQueryInternal } from "./interfaces/ISelectQueryInternal";
import { QueryBuilderPart } from "./QueryBuilderPart";
import { nameof } from "ts-simple-nameof";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export class Query<T extends EntityBase, R extends T | T[], P = T> implements IQuery<T, R, P>, IJoinedQuery<T, R, P>, IComparableQuery<T, R, P>, IJoinedComparableQuery<T, R, P>, IQueryInternal<T, R, P>, ISelectQueryInternal<T, R, P> {
    private readonly _getAction: () => Promise<R>;
    private readonly _includeAliasHistory: string[];
    private readonly _initialAlias: string;
    private readonly _query: SelectQueryBuilder<T>;
    private readonly _queryParts: IQueryBuilderPart<T>[];

    private _lastAlias: string;
    private _queryMode: QueryMode;
    private _queryWhereType: QueryWhereType;
    private _selectedProperty: string;

    /**
     * Constructs a Query wrapper.
     * @param queryBuilder The QueryBuilder to wrap.
     * @param getAction Either queryBuilder.getOne or queryBuilder.getMany.
     */
    public constructor(queryBuilder: SelectQueryBuilder<T>, getAction: () => Promise<R>) {
        this._getAction = getAction;
        this._includeAliasHistory = [];
        this._initialAlias = queryBuilder.alias;
        this._lastAlias = this._initialAlias;
        this._query = queryBuilder;
        this._queryMode = QueryMode.Get;
        this._queryParts = [];
        this._queryWhereType = QueryWhereType.Normal;
        this._selectedProperty = "";
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

    public get selected(): string {
        return this._selectedProperty;
    }

    public and<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P> {
        return this.andOr(propertySelector, SqlConstants.OPERATOR_AND, this._query.andWhere);
    }

    public beginsWith(value: string): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LIKE, value, true, true, false);
    }

    public catch(rejected: (error: any) => void | Promise<any> | IQuery<any, any>): Promise<any> {
        return this.toPromise().catch(rejected);
    }

    public contains(value: string): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LIKE, value, true, true, true);
    }

    public endsWith(value: string): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LIKE, value, true, false, true);
    }

    public equal(value: string | number | boolean): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_EQUAL, value);
    }

    public equalJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_EQUAL, selector);
    }

    // <any> is necessary here because the usage of this method depends on the interface from which it was called.
    public from<F extends { id: number }>(foreignEntity: { new(...params: any[]): F; }): IJoinedQuery<T, R, F> | IComparableQuery<T, R, F> | any {
        return this.joinForeignEntity(foreignEntity);
    }

    public greaterThan(value: number): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_GREATER, value);
    }

    public greaterThanJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_GREATER, selector);
    }

    public greaterThanOrEqual(value: number): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_GREATER_EQUAL, value);
    }

    public greaterThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_GREATER_EQUAL, selector);
    }

    public in(include: string[] | number[]): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_IN, `(${include.join(", ")})`);
    }

    public include<S>(propertySelector: (obj: T) => S | S[]): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._initialAlias);
    }

    public inSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQuery<TI, RI, PI1>): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(<ISelectQueryInternal<TI, RI, PI1>>innerQuery, SqlConstants.OPERATOR_IN);
    }

    public isFalse(): IQuery<T, R, P> {
        this.equal(false);
        return this;
    }

    public isNotNull(): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_IS, SqlConstants.OPERATOR_NOT_NULL, false);
    }

    public isNull(): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_IS, SqlConstants.OPERATOR_NULL, false);
    }

    public isTrue(): IQuery<T, R, P> {
        this.equal(true);
        return this;
    }

    public join<S extends Object>(propertySelector: (obj: T) => S | S[]): IQuery<T, R, S> | IComparableQuery<T, R, S> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._initialAlias);
    }

    public lessThan(value: number): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LESS, value);
    }

    public lessThanJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_LESS, selector);
    }

    public lessThanOrEqual(value: number): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LESS_EQUAL, value);
    }

    public lessThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_LESS_EQUAL, selector);
    }

    public notEqual(value: string | number | boolean): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_NOT_EQUAL, value);
    }

    public notEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_NOT_EQUAL, selector);
    }

    public notIn(exclude: string[] | number[]): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_NOT_IN, `(${exclude.join(", ")})`);
    }

    public notInSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQuery<TI, RI, PI1>): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(<ISelectQueryInternal<TI, RI, PI1>>innerQuery, SqlConstants.OPERATOR_NOT_IN);
    }

    public or<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P> {
        return this.andOr(propertySelector, SqlConstants.OPERATOR_OR, this._query.orWhere);
    }

    public orderBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.orderBy,
            [orderProperty, "ASC"]
        ));
        return this;
    }

    public orderByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.orderBy,
            [orderProperty, "DESC"]
        ));
        return this;
    }

    public select(propertySelector: (obj: any) => any): ISelectQuery<T, R, T> | ISelectQuery<T, R, P> {
        const selectedProperty: string = nameof(propertySelector);
        let alias: string = null;

        // If coming out of a comparison, query is back in "base mode" (where and select use base type).
        if (this._queryMode === QueryMode.Get) {
            alias = this._initialAlias;
        }
        // If in a join, use the last joined entity to select a property.
        else {
            alias = this._lastAlias;
        }

        this._selectedProperty = `${alias}.${selectedProperty}`;
        return this;
    }

    public skip(skip: number): IQuery<T, R, P> {
        if (skip > 0) {
            this._queryParts.push(new QueryBuilderPart(
                this._query.skip, [skip]
            ));
        }
        return this;
    }

    public take(limit: number): IQuery<T, R, P> {
        if (limit > 0) {
            this._queryParts.push(new QueryBuilderPart(
                this._query.take, [limit]
            ));
        }
        return this;
    }

    public then(resolved: (results: R) => void | Promise<any>): Promise<any> {
        return this.toPromise().then(resolved);
    }

    public thenBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.addOrderBy,
            [orderProperty, "ASC"]
        ));
        return this;
    }

    public thenByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.addOrderBy,
            [orderProperty, "DESC"]
        ));
        return this;
    }

    public thenInclude<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._lastAlias);
    }

    public thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S> | IComparableQuery<T, R, P> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._lastAlias);
    }

    public toPromise(): Promise<R> {
        return this._getAction.call(this.buildQuery(this));
    }

    public usingBaseType(): IQuery<T, R, T> {
        this._lastAlias = this._initialAlias;
        return <IQuery<T, R, T>><any>this;
    }

    public where<S extends Object, F = T | P>(propertySelector: (obj: F) => S): IComparableQuery<T, R, T> | IComparableQuery<T, R, P> | any {
        const whereProperty: string = nameof<F>(propertySelector);

        // In the event of performing a normal where after a join-based where, use the initial alias.
        if (this._queryMode === QueryMode.Get) {
            this._queryWhereType = QueryWhereType.Normal;
            this._lastAlias = this._initialAlias;
            const where: string = `${this._lastAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                this._query.where, [where]
            ));
        }
        // Otherwise, this where was performed on a join operation.
        else {
            this._queryWhereType = QueryWhereType.Joined;
            this.createJoinCondition(whereProperty);
        }

        this._queryMode = QueryMode.Compare;

        return <IComparableQuery<T, R, T>><any>this;
    }

    private addJoinCondition(whereProperty: string, condition: "AND" | "OR", targetQueryPart: IQueryBuilderPart<T> = null): void {
        // Result of calling .include(x => x.prop).where(...).<compare>(...).<and/or>(...)
        // [QueryBuilder.leftJoinAndSelect, ["alias.includedProperty", "includedProperty", "includedProperty.property = 'something'"]]
        // OR
        // Result of calling .join(x => x.pop).where(...).<compare>(...).<and/or>(...)
        // [QueryBuilder.innerJoin, ["alias.includedProperty", "includedProperty", "includedProperty.property = 'something'"]]
        const part: IQueryBuilderPart<T> = targetQueryPart || this._queryParts.pop();

        // "includedProperty.property = 'something'"
        let joinCondition: string = (<[string]>part.queryParams).pop();
        joinCondition += ` ${condition} ${this._lastAlias}.${whereProperty}`;
        (<[string]>part.queryParams).push(joinCondition);

        // If we did not receive the optional taretQueryPart argument, that means we used the last query part, which was popped from this._queryParts.
        if (!targetQueryPart) {
            this._queryParts.push(part);
        }
    }

    private andOr<S extends Object>(
        propertySelector: (obj: P) => S,
        operation: "AND" | "OR",
        queryAction: (where: string, parameters?: ObjectLiteral) => SelectQueryBuilder<T>
    ): IComparableQuery<T, R, P> {
        const whereProperty: string = nameof<P>(propertySelector);

        // A third parameter on the query parameters indicates additional join conditions.
        // Only add a join condition if performing a conditional join.
        if (
            this._queryWhereType === QueryWhereType.Joined &&
            this._queryParts[this._queryParts.length - 1].queryParams.length === 3
        ) {
            this.addJoinCondition(whereProperty, operation);
        }
        else {
            const where: string = `${this._lastAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                queryAction, [where]
            ));
        }

        this._queryMode = QueryMode.Compare;

        return this;
    }

    private buildQuery(query: IQueryInternal<T, R, any>): SelectQueryBuilder<T> {
        // Unpack and apply the QueryBuilder parts.
        if (query.queryParts.length) {
            for (const queryPart of query.queryParts) {
                queryPart.queryAction.call(query.query, ...queryPart.queryParams);
            }
        }
        return query.query;
    }

    private completeJoinedWhere(operator: string, selector: (obj: P) => any): IQuery<T, R, P> {
        const selectedProperty: string = nameof<P>(selector);
        const compareValue: string = `${this._lastAlias}.${selectedProperty}`;
        // compareValue is a string but should be treated as a join property
        // (not a quoted string) in the query, so use "false" for the "quoteString" argument.
        return this.completeWhere(operator, compareValue, false);
    }

    private completeWhere(operator: string, value: string | number | boolean, quoteString: boolean = true, beginsWith: boolean = false, endsWith: boolean = false): IQuery<T, R, P> {
        if (beginsWith) {
            value += "%";
        }
        if (endsWith) {
            value = `%${value}`;
        }

        if (typeof value === "string" && quoteString) {
            value = value.replace(/'/g, "''");
            value = `'${value}'`;
        }

        // In case of a from or join within a "where", must find the last "where" in the query parts.
        const nonWheres: IQueryBuilderPart<T>[] = [];
        let wherePart: IQueryBuilderPart<T> = null;

        while (this._queryParts.length && !wherePart) {
            const part = this._queryParts.pop();
            if (
                (
                    // Could either be a normal where function:
                    this._queryWhereType === QueryWhereType.Normal && (
                        part.queryAction == this._query.where ||
                        part.queryAction == this._query.andWhere ||
                        part.queryAction == this._query.orWhere
                    )
                ) || (
                    // or a join condition:
                    this._queryWhereType === QueryWhereType.Joined && (
                        part.queryAction == this._query.innerJoin ||
                        part.queryAction == this._query.leftJoinAndSelect
                    ) && part.queryParams.length === 3
                )
            ) {
                wherePart = part;
            }
            else {
                nonWheres.unshift(part);
            }
        }

        if (!wherePart) {
            throw new Error("Invalid use of conditional method.");
        }

        this._queryParts.push(...nonWheres);

        // If processing a join condition.
        if (this._queryWhereType === QueryWhereType.Joined) {
            // [QueryBuilder.leftJoinAndSelect, ["alias.includedProperty", "includedProperty", "includedProperty.property"]]
            const part: IQueryBuilderPart<T> = wherePart;
            // "includedProperty.property"
            let joinCondition: string = (<[string]>part.queryParams).pop();
            // "includedProperty.property = 'something'"
            joinCondition += ` ${operator} ${value}`;
            (<[string]>part.queryParams).push(joinCondition);
            this._queryParts.push(part);
        }
        // If processing a normal comparison.
        else {
            // [QueryBuilder.<where | andWhere | orWhere>, ["alias.property"]]
            const part: IQueryBuilderPart<T> = wherePart;
            // "alias.property"
            let where: string = (<[string]>part.queryParams).pop();

            where += ` ${operator} ${value}`;
            (<[string, ObjectLiteral]>part.queryParams).push(where);
            this._queryParts.push(part);
        }

        this._queryMode = QueryMode.Get;

        return this;
    }

    private createJoinCondition(joinConditionProperty: string): void {
        // Find the query part on which to add the condition. Usually will be the last, but not always.
        let targetQueryPart: IQueryBuilderPart<T> = null;
        const otherParts: IQueryBuilderPart<T>[] = [];

        while (!targetQueryPart && this._queryParts.length) {
            const part: IQueryBuilderPart<T> = this._queryParts.pop();
            // See if this query part is the one in which the last alias was joined.
            if (part.queryParams && part.queryParams.length > 1 && part.queryParams[1] === this._lastAlias) {
                targetQueryPart = part;
            }
            else {
                otherParts.unshift(part);
            }
        }

        if (!targetQueryPart) {
            throw new Error("Invalid use of conditional join.");
        }

        this._queryParts.push(...otherParts);

        // There should not already be a join condition on this query builder part.
        // If there is, we want to add a join condition, not overwrite it.
        if (targetQueryPart.queryParams.length === 3) {
            this.addJoinCondition(joinConditionProperty, "AND", targetQueryPart);
        }
        else {
            const joinCondition: string = `${this._lastAlias}.${joinConditionProperty}`;
            (<[string]>targetQueryPart.queryParams).push(joinCondition);
        }

        this._queryParts.push(targetQueryPart);
    }

    private includeOrExcludeFromInnerQuery<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQueryInternal<TI, RI, PI1>, operator: string): IQuery<T, R, P> {
        innerQuery.queryParts.unshift(new QueryBuilderPart(
            innerQuery.query.select, [innerQuery.selected]
        ));

        // Use <any> since all that matters is that the base type of any query contains a property named "id".
        const query: string = this.buildQuery(<any>innerQuery).getQuery();
        this.completeWhere(operator, `(${query})`, false);
        return this;
    }

    private includePropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string): IQuery<T, R, S> {
        return this.joinOrIncludePropertyUsingAlias(propertySelector, queryAlias, this._query.leftJoinAndSelect);
    }

    private joinForeignEntity<F extends Object>(foreignEntity: { new(...params: any[]): F; }): IQuery<T, R, F> | IComparableQuery<T, R, F> {
        const entityName: string = nameof(foreignEntity);
        const resultAlias: string = entityName;
        this._lastAlias = resultAlias;
        // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
        // Only execute the include if it has not been previously executed.
        if (!(this._includeAliasHistory.find(a => a === resultAlias))) {
            this._includeAliasHistory.push(resultAlias);
            this._queryParts.push(new QueryBuilderPart(
                this._query.innerJoin, [foreignEntity, resultAlias, "true"]
            ));
        }

        this.setJoinIfNotCompare();

        return <IQuery<T, R, F> | IComparableQuery<T, R, F>><any>this;
    }

    private joinOrIncludePropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string, queryAction: (...params: any[]) => SelectQueryBuilder<T>): IQuery<T, R, S> {
        const propertyName: string = nameof<P>(propertySelector);
        const resultAlias: string = `${queryAlias}_${propertyName}`;

        this.setJoinIfNotCompare();

        this._lastAlias = resultAlias;
        // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
        // Only execute the include if it has not been previously executed.
        if (!(this._includeAliasHistory.find(a => a === resultAlias))) {
            this._includeAliasHistory.push(resultAlias);
            const queryProperty: string = `${queryAlias}.${propertyName}`;
            this._queryParts.push(new QueryBuilderPart(
                queryAction,
                [queryProperty, resultAlias]
            ));
        }
        return <IQuery<T, R, S>><any>this;
    }

    private joinPropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string): IQuery<T, R, S> {
        return this.joinOrIncludePropertyUsingAlias(propertySelector, queryAlias, this._query.innerJoin);
    }

    private setJoinIfNotCompare(): void {
        // We may be joining a relation to make a comparison on that relation.
        // If so, leave QueryMode as Compare.
        // If not, set QueryMode to Join.
        if (this._queryMode !== QueryMode.Compare) {
            this._queryMode = QueryMode.Join;
        }
    }
}