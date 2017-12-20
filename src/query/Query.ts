import { SqlConstants } from "../constants/SqlConstants";
import { QueryWhereType } from "../enums/QueryWhereType";
import { IComparableQuery } from "./interfaces/IComparableQuery";
import { IJoinedComparableQuery } from "./interfaces/IJoinedComparableQuery";
import { IJoinedQuery } from "./interfaces/IJoinedQuery";
import { IQuery } from "./interfaces/IQuery";
import { IQueryBuilderPart } from "./interfaces/IQueryBuilderPart";
import { IQueryInternal } from "./interfaces/IQueryInternal";
import { QueryBuilderPart } from "./QueryBuilderPart";
import { nameof } from "ts-simple-nameof";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

export class Query<T extends { id: number }, R = T | T[], P = T> implements IQuery<T, R, P>, IJoinedQuery<T, R, P>, IComparableQuery<T, R, P>, IJoinedComparableQuery<T, R, P>, IQueryInternal<T, R, P> {
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
    public constructor(queryBuilder: SelectQueryBuilder<T>, getAction: () => Promise<R>) {
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

    public get initialAlias(): string {
        return this._initialAlias;
    }

    public get query(): SelectQueryBuilder<T> {
        return this._query;
    }

    public get queryParts(): IQueryBuilderPart<T>[] {
        return this._queryParts;
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
        // Per notes: this is no longer true.
        // // This method will always result in a where type of "inner join".
        // this._queryWhereType = QueryWhereType.InnerJoin;

        // Can we go ahead and set QueryWhereType.InnerJoin so that .where() will not reset alias?
        // Assume it's ok since .join(), .thenJoin(), etc. will set it anyway.
        this._queryWhereType = QueryWhereType.InnerJoin;

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

    public includeWhere<S extends Object>(propertySelector: (obj: T) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        const includeProperty: string = nameof<T>(propertySelector);
        const includeConditionProperty: string = nameof<S>(subPropertySelector);
        this.createJoinCondition(includeProperty, includeConditionProperty);
        this._queryWhereType = QueryWhereType.Include;
        return <IComparableQuery<T, R, S>><any>this;
    }

    // TODO: selectFromInnerQuery should not use type S as its entity type.
    public inSelected<I extends { id: number }, S extends Object>(innerQuery: IQuery<I, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(<IQueryInternal<I, R, S>>innerQuery, selectFromInnerQuery, SqlConstants.OPERATOR_IN);
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
        // Per notes:
        // Calling this method could mean that the QueryWhereType should be InnerJoin.
        // If any other methods need to set the QueryWhereType to something else, they will do so.
        // This enables .where() to conditionally use either the initial or last alias as needed
        // depending on whether or not a join was used before calling .where().

        // Now, since optional subPropertySelector has been removed from where/and/or,
        // no longer need to check QueryWhereType.InnerJoin in where method.
        // Therefore, safe (?) to use QueryWhereType.InnerJoin in all join methods
        // in order to conditionally set alias in where method(s).

        // TODO: Revisit this; thinking now that QueryWhereType.InnerJoin and QueryBuilderPart parameters
        // should be checked while doing basic joins in order to defer the conditional join.

        this._queryWhereType = QueryWhereType.InnerJoin;

        return this.joinPropertyUsingAlias(propertySelector, this._initialAlias);
    }

    public joinWhere<S extends Object>(propertySelector: (obj: T) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        const includeProperty: string = nameof<T>(propertySelector);
        const includeConditionProperty: string = nameof<S>(subPropertySelector);
        this._queryWhereType = QueryWhereType.InnerJoin;
        this.createJoinCondition(includeProperty, includeConditionProperty);
        return <IComparableQuery<T, R, S>><any>this;
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

    // TODO: selectFromInnerQuery should not use type S as its entity type.
    public notInSelected<I extends { id: number }, S extends Object>(innerQuery: IQuery<I, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(<IQueryInternal<I, R, S>>innerQuery, selectFromInnerQuery, "NOT IN");
    }

    public notNull(): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_IS, SqlConstants.OPERATOR_NOT_NULL, false);
    }

    public null(): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_IS, SqlConstants.OPERATOR_NULL, false);
    }

    public or<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P> {
        return this.andOr(propertySelector, SqlConstants.OPERATOR_OR, this._query.orWhere);
    }

    public orderBy(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.orderBy, [orderProperty, "ASC"]
        ));
        return this;
    }

    public orderByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
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
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.addOrderBy, [orderProperty, "ASC"]
        ));
        return this;
    }

    public thenByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;
        this._queryParts.push(new QueryBuilderPart(
            this._query.addOrderBy, [orderProperty, "DESC"]
        ));
        return this;
    }

    public thenInclude<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._lastAlias);
    }

    public thenIncludeWhere<S extends Object>(propertySelector: (obj: P) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        const includeProperty: string = nameof<P>(propertySelector);
        const includeConditionProperty: string = nameof<S>(subPropertySelector);
        this.createJoinCondition(includeProperty, includeConditionProperty);
        this._queryWhereType = QueryWhereType.Include;
        return <IComparableQuery<T, R, S>><any>this;
    }

    public thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S> | IComparableQuery<T, R, P> | any {
        // Do NOT set QueryWhereType to InnerJoin here in case the flow is something like
        // .from(...).thenJoin(...).where/and/or(...),
        // in which case a normal where/andWhere/orWhere is desired.

        // Now, since optional subPropertySelector has been removed from where/and/or,
        // no longer need to check QueryWhereType.InnerJoin in where method.
        // Therefore, safe (?) to use QueryWhereType.InnerJoin in all join methods
        // in order to conditionally set alias in where method(s).

        // TODO: Revisit this; thinking now that QueryWhereType.InnerJoin and QueryBuilderPart parameters
        // should be checked while doing basic joins in order to defer the conditional join.

        this._queryWhereType = QueryWhereType.InnerJoin;

        return this.joinPropertyUsingAlias(propertySelector, this._lastAlias);
    }

    public thenJoinWhere<S extends Object>(propertySelector: (obj: P) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S> {
        const includeProperty: string = nameof<P>(propertySelector);
        const includeConditionProperty: string = nameof<S>(subPropertySelector);
        this._queryWhereType = QueryWhereType.InnerJoin;
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

    public where<S extends Object, F = T | P>(propertySelector: (obj: F) => S): IComparableQuery<T, R, T> | IComparableQuery<T, R, P> | any {
        // Per notes:
        // If QueryWhereType is InnerJoin, we want to use the last joined type and alias.
        // Otherwise, this method should use the base type and initial alias.
        if (this._queryWhereType !== QueryWhereType.InnerJoin) {
            this._lastAlias = this._initialAlias;
        }

        const whereProperty: string = nameof<F>(propertySelector);
        // if (subPropertySelector) {
        //     const whereConditionProperty: string = nameof<S>(subPropertySelector);
        //     this._queryWhereType = QueryWhereType.InnerJoin;
        //     this.createJoinCondition(whereProperty, whereConditionProperty);
        // }
        // else {
            const where: string = `${this._lastAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                this._query.where, [where]
            ));
            this._queryWhereType = QueryWhereType.Normal;
        // }
        return <IComparableQuery<T, R, T>><any>this;
    }

    private addJoinCondition(whereProperty: string, condition: "AND" | "OR"): void {
        // Result of calling includeWhere(x => x.prop).<compare>(...).<and/or>(...)
        // [QueryBuilder.leftJoinAndSelect, ["alias.includedProperty", "includedProperty", "includedProperty.property = 'something'"]]
        // OR
        // Result of calling where(x => x.prop, y => y.prop).<compare>(...).<and/or>(...) or joinWhere(x => x.prop).<compare>(...).<and/or>(...)
        // [QueryBuilder.innerJoin, ["alias.includedProperty", "includedProperty", "includedProperty.property = 'something'"]]
        // OR
        // Result of calling where(...).<compare>(...).from(...).<and/or>(...)
        // [QueryBuilder.where, ["alias.includedProperty <IN/NOT IN> (...)"]]
        const part: IQueryBuilderPart<T> = this._queryParts.pop();

        // "includedProperty.property = 'something'"
        let joinCondition: string = (<[string]>part.queryParams).pop();

        // If dealing with a join or include, the joined property's alias will be at the end of the query params array.
        if (part.queryParams.length) {
            // TODO: Use last alias instead? Causing additional join conditions
            // following joins, thenJoins, etc. to fail due to bad alias.

            // "includedProperty"
            const joinAlias: string = (<[string]>part.queryParams).pop();

            // "otherProperty"
            // "includedProperty.property = 'something' <AND/OR> includedProperty.otherProperty" (to be finished in completeWhere())
            joinCondition += ` ${condition} "${joinAlias}"."${whereProperty}"`;
            (<[string]>part.queryParams).push(joinAlias);
        }
        // Otherwise, "and" or "or" was called after calling "where" followed by "from", so the condition was the only element in the query params array.
        else {
            joinCondition += ` ${condition} "${this._lastAlias}"."${whereProperty}"`;
        }

        (<[string]>part.queryParams).push(joinCondition);
        this._queryParts.push(part);
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
            this._queryWhereType !== QueryWhereType.Normal &&
            this._queryParts[this._queryParts.length - 1].queryParams.length === 3
        ) {
            this.addJoinCondition(whereProperty, operation);
        }
        // else if (subPropertySelector) {
        //     const whereConditionProperty: string = nameof<S>(subPropertySelector);
        //     this._queryWhereType = QueryWhereType.InnerJoin;
        //     this.createJoinCondition(whereProperty, whereConditionProperty);
        // }
        else {
            const where: string = `${this._lastAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                queryAction, [where]
            ));
        }

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
        this._queryWhereType = QueryWhereType.InnerJoin;
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

        // Don't use ObjectLiteral? (See below.)
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
            // Don't use ObjectLiteral? (See below.)
            // if (typeof value === "string" && quoteString) {
            //     value = value.replace(/'/g, "''");
            //     value = `'${value}'`;
            // }

            // If we did not find a QueryPart whose queryAction is "where", "andWhere", or "orWhere",
            // then this must be a join or select using .equalJoined(), etc.
            // In that case, use the last QueryPart.
            if (!wherePart) {
                // TODO: Is this going to work?
                wherePart = this._queryParts.pop();
            }

            // [QueryBuilder.leftJoinAndSelect, ["alias.includedProperty", "includedProperty", "includedProperty.property"]]
            const part: IQueryBuilderPart<T> = wherePart;
            // "includedProperty.property"
            let joinCondition: string = (<[string]>part.queryParams).pop();
            // "includedProperty.property = 'something'"
            joinCondition += ` ${operator} ${value}`;
            (<[string]>part.queryParams).push(joinCondition);
            this._queryParts.push(part);
        }
        else {
            // [QueryBuilder.<where | andWhere | orWhere>, ["alias.property"]]
            const part: IQueryBuilderPart<T> = wherePart;
            // "alias.property"
            let where: string = (<[string]>part.queryParams).pop();
            // where += ` ${operator} :value`; // Don't use ObjectLiteral?
            where += ` ${operator} ${value}`;
            // const whereParam: ObjectLiteral = { value: value }; // Don't use ObjectLiteral?
            (<[string, ObjectLiteral]>part.queryParams).push(where);
            // (<[string, ObjectLiteral]>part.queryParams).push(whereParam); // Don't use ObjectLiteral?
            this._queryParts.push(part);
        }

        return this;
    }

    private createJoinCondition(joinProperty: string, joinConditionProperty: string): void {
        // TODO: Pretty sure this method needs to call joinOrIncludeUsingAlias.
        // Or, more likely, includeWhere, joinWhere, etc. need to call it.

        // alias.property
        const joinPropertyFull: string = `${this._lastAlias}.${joinProperty}`;
        // alias_property
        const joinAlias: string = `${this._lastAlias}_${joinProperty}`;
        // TODO: Do we need to be setting last alias here?
        this._lastAlias = joinAlias;
        // alias_property.conditionProperty
        const joinCondition: string = `${joinAlias}.${joinConditionProperty}`;

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

    private includeOrExcludeFromInnerQuery<I extends { id: number }, S extends Object>(innerQuery: IQueryInternal<I, R, S>, selectFromInnerQuery: (obj: S) => any, operator: string): IQuery<T, R, P> {
        // const selectedProperty: string = nameof<T>(propertySelector);
        // const outerQuerySelected: string = `${this._initialAlias}.${selectedProperty}`;
        const innerQueryProperty: string = nameof<S>(selectFromInnerQuery);
        const innerQuerySelected: string = `"${innerQuery.initialAlias}"."${innerQueryProperty}"`;
        innerQuery.queryParts.unshift(new QueryBuilderPart(
            innerQuery.query.select, [innerQuerySelected]
        ));
        // Use <any> since all that matters is that the base type of any query contains a property named "id".
        const query: string = this.buildQuery(<any>innerQuery).getQuery();
        // this._queryParts.push(new QueryBuilderPart(
        //     this._query.where, [`${outerQuerySelected} ${operator} (${query})`]
        // ));
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
        return <IQuery<T, R, F> | IComparableQuery<T, R, F>><any>this;
    }

    private joinOrIncludePropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => S | S[], queryAlias: string, queryAction: (...params: any[]) => SelectQueryBuilder<T>): IQuery<T, R, S> {
        const propertyName: string = nameof<P>(propertySelector);
        const resultAlias: string = `${queryAlias}_${propertyName}`;
        this._lastAlias = resultAlias;
        // If just passing through a chain of possibly already executed includes for semantics, don't execute the include again.
        // Only execute the include if it has not been previously executed.

        // TODO: Check QueryWhereType.InnerJoin here as well as enough QueryBuilderPart parameters
        // to perform a join with a condition in order to insert this join before that join?

        if (!(this._includeAliasHistory.find(a => a === resultAlias))) {
            this._includeAliasHistory.push(resultAlias);
            const queryProperty: string = `${queryAlias}.${propertyName}`;
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