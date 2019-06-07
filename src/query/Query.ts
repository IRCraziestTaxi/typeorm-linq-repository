import { nameof } from "ts-simple-nameof";
import { Brackets, ObjectLiteral, SelectQueryBuilder, WhereExpression } from "typeorm";
import { SqlConstants } from "../constants/SqlConstants";
import { QueryMode } from "../enums/QueryMode";
import { QueryWhereType } from "../enums/QueryWhereType";
import { EntityBase } from "../types/EntityBase";
import { JoinedEntityType } from "../types/JoinedEntityType";
import { QueryConditionOptions } from "../types/QueryConditionOptions";
import { QueryConditionOptionsInternal } from "../types/QueryConditionOptionsInternal";
import { IComparableQuery } from "./interfaces/IComparableQuery";
import { IJoinedComparableQuery } from "./interfaces/IJoinedComparableQuery";
import { IJoinedQuery } from "./interfaces/IJoinedQuery";
import { IQuery } from "./interfaces/IQuery";
import { IQueryBuilderPart } from "./interfaces/IQueryBuilderPart";
import { IQueryInternal } from "./interfaces/IQueryInternal";
import { ISelectQuery } from "./interfaces/ISelectQuery";
import { ISelectQueryInternal } from "./interfaces/ISelectQueryInternal";
import { QueryBuilderPart } from "./QueryBuilderPart";
import { QueryOrderOptions } from "../types/QueryOrderOptions";

export class Query<T extends EntityBase, R extends T | T[], P = T>
    implements IQuery<T, R, P>, IJoinedQuery<T, R, P>,
    IComparableQuery<T, R, P>,
    IJoinedComparableQuery<T, R, P>,
    IQueryInternal<T, R, P>,
    ISelectQueryInternal<T, R, P> {
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
    public constructor(
        queryBuilder: SelectQueryBuilder<T>,
        getAction: () => Promise<R>,
        includeAliasHistory: string[] = []
    ) {
        this._getAction = getAction;
        this._includeAliasHistory = includeAliasHistory;
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

    public beginsWith(value: string, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeWhere(
            SqlConstants.OPERATOR_LIKE,
            value,
            {
                beginsWith: true
            },
            options
        );
    }

    public catch(rejected: (error: any) => void | Promise<any> | IQuery<any, any>): Promise<any> {
        return this.toPromise()
            .catch(rejected);
    }

    public contains(value: string, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeWhere(
            SqlConstants.OPERATOR_LIKE,
            value,
            {
                beginsWith: true,
                endsWith: true
            },
            options
        );
    }

    public count(): Promise<number> {
        const targetQueryBuilder = this._query.clone();
        this.compileQueryParts(this._queryParts, targetQueryBuilder);

        return targetQueryBuilder.getCount();
    }

    public endsWith(value: string, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeWhere(
            SqlConstants.OPERATOR_LIKE,
            value,
            {
                endsWith: true
            },
            options
        );
    }

    public equal(value: string | number | boolean | Date, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_EQUAL, value, null, options);
    }

    public equalJoined(selector: (obj: P) => any, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_EQUAL, selector, options);
    }

    // <any> is necessary here because the usage of this method depends on the interface from which it was called.
    public from<F extends { id: number }>(foreignEntity: { new(...params: any[]): F; }): IJoinedQuery<T, R, F> | IComparableQuery<T, R, F> | any {
        return this.joinForeignEntity(foreignEntity);
    }

    public greaterThan(value: number | Date): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_GREATER, value);
    }

    public greaterThanJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_GREATER, selector);
    }

    public greaterThanOrEqual(value: number | Date): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_GREATER_EQUAL, value);
    }

    public greaterThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_GREATER_EQUAL, selector);
    }

    public in(include: string[] | number[], options?: QueryConditionOptions): IQuery<T, R, P> {
        // If comparing strings, must escape them as strings in the query.
        this.escapeStringArray(include as string[]);

        return this.completeWhere(
            SqlConstants.OPERATOR_IN,
            `(${include.join(", ")})`,
            { quoteString: false },
            options
        );
    }

    public include<S>(propertySelector: (obj: T) => JoinedEntityType<S>): IQuery<T, R, S> {
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
        return this.completeWhere(SqlConstants.OPERATOR_IS, SqlConstants.OPERATOR_NOT_NULL, { quoteString: false });
    }

    public isNull(): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_IS, SqlConstants.OPERATOR_NULL, { quoteString: false });
    }

    public isolatedAnd<S extends Object>(and: (query: IQuery<T, R, P>) => IQuery<T, R, S>): IQuery<T, R, P> {
        // TODO: These types are not lining up.
        return <IQuery<T, R, P>><any>this.isolatedConditions<T, P>(<() => IQuery<T, R, P>><any>and, this._query.andWhere);
    }

    public isolatedOr<S extends Object>(and: (query: IQuery<T, R, P>) => IQuery<T, R, S>): IQuery<T, R, P> {
        // TODO: These types are not lining up.
        return <IQuery<T, R, P>><any>this.isolatedConditions<T, P>(<() => IQuery<T, R, P>><any>and, this._query.orWhere);
    }

    public isolatedWhere<S extends Object>(where: (query: IQuery<T, R, T>) => IQuery<T, R, S>): IQuery<T, R, T> {
        // TODO: These types are not lining up.
        return this.isolatedConditions<T, S>(<() => IQuery<T, R, S>><any>where, this._query.where);
    }

    public isTrue(): IQuery<T, R, P> {
        this.equal(true);

        return this;
    }

    public join<S extends Object>(propertySelector: (obj: T) => JoinedEntityType<S>): IQuery<T, R, S> | IComparableQuery<T, R, S> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._initialAlias);
    }

    public joinAlso<S extends Object>(propertySelector: (obj: T) => JoinedEntityType<S>): IQuery<T, R, S> | IComparableQuery<T, R, S> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._initialAlias, this._query.leftJoin);
    }

    public lessThan(value: number | Date): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LESS, value);
    }

    public lessThanJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_LESS, selector);
    }

    public lessThanOrEqual(value: number | Date): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_LESS_EQUAL, value);
    }

    public lessThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_LESS_EQUAL, selector);
    }

    public notEqual(value: string | number | boolean | Date, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeWhere(SqlConstants.OPERATOR_NOT_EQUAL, value, null, options);
    }

    public notEqualJoined(selector: (obj: P) => any, options?: QueryConditionOptions): IQuery<T, R, P> {
        return this.completeJoinedWhere(SqlConstants.OPERATOR_NOT_EQUAL, selector, options);
    }

    public notIn(exclude: string[] | number[], options?: QueryConditionOptions): IQuery<T, R, P> {
        // If comparing strings, must escape them as strings in the query.
        this.escapeStringArray(exclude as string[]);

        return this.completeWhere(
            SqlConstants.OPERATOR_NOT_IN,
            `(${exclude.join(", ")})`,
            { quoteString: false },
            options
        );
    }

    public notInSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQuery<TI, RI, PI1>): IQuery<T, R, P> {
        return this.includeOrExcludeFromInnerQuery(<ISelectQueryInternal<TI, RI, PI1>>innerQuery, SqlConstants.OPERATOR_NOT_IN);
    }

    public or<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P> {
        return this.andOr(propertySelector, SqlConstants.OPERATOR_OR, this._query.orWhere);
    }

    public orderBy(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;

        return this.completeOrderBy(
            this._query.orderBy,
            [orderProperty, "ASC"],
            options
        );
    }

    public orderByDescending(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;

        return this.completeOrderBy(
            this._query.orderBy,
            [orderProperty, "DESC"],
            options
        );
    }

    public reset(): IQuery<T, R, T> {
        this._lastAlias = this._initialAlias;
        // Exit the "join chain" so that additional comparisons may be made on the base entity.
        this._queryWhereType = QueryWhereType.Normal;

        return <IQuery<T, R, T>><any>this;
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
        return this.toPromise()
            .then(resolved);
    }

    public thenBy(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;

        return this.completeOrderBy(
            this._query.addOrderBy,
            [orderProperty, "ASC"],
            options
        );
    }

    public thenByDescending(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P> {
        const propertyName: string = nameof<P>(propertySelector);
        const orderProperty: string = `${this._lastAlias}.${propertyName}`;

        return this.completeOrderBy(
            this._query.addOrderBy,
            [orderProperty, "DESC"],
            options
        );
    }

    public thenInclude<S extends Object>(propertySelector: (obj: P) => JoinedEntityType<S>): IQuery<T, R, S> {
        return this.includePropertyUsingAlias<S>(propertySelector, this._lastAlias);
    }

    public thenJoin<S extends Object>(propertySelector: (obj: P) => JoinedEntityType<S>): IQuery<T, R, S> | IComparableQuery<T, R, S> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._lastAlias);
    }

    public thenJoinAlso<S extends Object>(propertySelector: (obj: P) => JoinedEntityType<S>): IQuery<T, R, S> | IComparableQuery<T, R, S> | any {
        return this.joinPropertyUsingAlias(propertySelector, this._lastAlias, this._query.leftJoin);
    }

    public toPromise(): Promise<R> {
        return this._getAction.call(this.buildQuery(this));
    }

    public usingBaseType(): IQuery<T, R, T> {
        this._lastAlias = this._initialAlias;

        return <IQuery<T, R, T>><any>this;
    }

    public where<S extends Object, F = T | P>(propertySelector: (obj: F) => S): IComparableQuery<T, R, T> | IComparableQuery<T, R, P> | any {
        const whereProperties: string = nameof<F>(propertySelector);
        let whereProperty: string = null;

        // Keep up with the last alias in order to restore it after joinMultipleProperties.
        let lastAlias: string = this._lastAlias;

        // In the event of performing a normal where after a join-based where, use the initial alias.
        if (this._queryMode === QueryMode.Get) {
            this._queryWhereType = QueryWhereType.Normal;
            lastAlias = this._initialAlias;

            // If accessing multiple properties, join relationships using an INNER JOIN.
            whereProperty = this.joinMultipleProperties(whereProperties);

            const where: string = `${lastAlias}.${whereProperty}`;
            this._queryParts.push(new QueryBuilderPart(
                this._query.where, [where]
            ));
        }
        // Otherwise, this where was performed on a join operation.
        else {
            // If accessing multiple properties, join relationships using an INNER JOIN.
            whereProperty = this.joinMultipleProperties(whereProperties);

            this._queryWhereType = QueryWhereType.Joined;
            this.createJoinCondition(whereProperty);
        }

        // Restore the last alias after joinMultipleProperties.
        this._lastAlias = lastAlias;

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
        const whereProperties: string = nameof<P>(propertySelector);

        // If accessing multiple properties during an AND, join relationships using an INNER JOIN.
        // If accessing multiple properties during an OR, join relationships using a LEFT JOIN.
        const joinAction: (...params: any[]) => SelectQueryBuilder<T> =
            operation === "AND"
                ? this._query.innerJoin
                : this._query.leftJoin;

        // Keep up with the last alias in order to restore it after joinMultipleProperties.
        const lastAlias: string = this._lastAlias;

        // If accessing multiple properties, join relationships using an INNER JOIN.
        const whereProperty: string = this.joinMultipleProperties(whereProperties, joinAction);

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
                queryAction,
                [where]
            ));
        }

        // Restore the last alias after joinMultipleProperties.
        this._lastAlias = lastAlias;

        this._queryMode = QueryMode.Compare;

        return this;
    }

    private buildQuery(query: IQueryInternal<T, R, any>): SelectQueryBuilder<T> {
        // Unpack and apply the QueryBuilder parts.
        this.compileQueryParts(query.queryParts, query.query);

        return query.query;
    }

    private compileQueryParts<PT>(queryParts: IQueryBuilderPart<PT>[], builder: WhereExpression): void {
        if (queryParts.length) {
            for (const queryPart of queryParts) {
                queryPart.queryAction.call(builder, ...queryPart.queryParams);
            }
        }
    }

    private completeOrderBy(queryAction: (...params: any[]) => any, queryParams: any[], options?: QueryOrderOptions): IQuery<T, R, P>{
        if (options) {
            if (typeof (options.nullsFirst) === "boolean") {
                    queryParams.push(options.nullsFirst ? "NULLS FIRST":"NULLS LAST");
            }
        }
        this._queryParts.push(new QueryBuilderPart(
            queryAction,
            queryParams
        ));

        return this;
    }

    private completeJoinedWhere(
        operator: string,
        selector: (obj: P) => any,
        options?: QueryConditionOptions
    ): IQuery<T, R, P> {
        const selectedProperty: string = nameof<P>(selector);
        const compareValue: string = `${this._lastAlias}.${selectedProperty}`;

        // compareValue is a string but should be treated as a join property
        // (not a quoted string) in the query, so use "false" for the "quoteString" argument.
        // If the user specifies a matchCase option, then assume the property is, in fact, a string
        // and allow completeWhere to apply case insensitivity if necessary.
        return this.completeWhere(
            operator,
            compareValue,
            {
                joiningString: !!options && typeof (options.matchCase) === "boolean",
                quoteString: false
            },
            options
        );
    }

    private completeWhere(
        operator: string,
        value: string | number | boolean | Date,
        optionsInternal?: QueryConditionOptionsInternal,
        options?: QueryConditionOptions
    ): IQuery<T, R, P> {
        let beginsWith: boolean = false;
        let endsWith: boolean = false;
        let joiningString: boolean = false;
        let quoteString: boolean = true;
        let matchCase: boolean = false;

        if (optionsInternal) {
            if (typeof (optionsInternal.beginsWith) === "boolean") {
                beginsWith = optionsInternal.beginsWith;
            }

            if (typeof (optionsInternal.endsWith) === "boolean") {
                endsWith = optionsInternal.endsWith;
            }

            if (typeof (optionsInternal.joiningString) === "boolean") {
                joiningString = optionsInternal.joiningString;
            }

            if (typeof (optionsInternal.quoteString) === "boolean") {
                quoteString = optionsInternal.quoteString;
            }
        }

        if (options) {
            if (typeof (options.matchCase) === "boolean") {
                matchCase = options.matchCase;
            }
        }

        if (beginsWith) {
            value += "%";
        }

        if (endsWith) {
            value = `%${value}`;
        }

        if (typeof (value) === "string" && quoteString) {
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
                        // tslint:disable-next-line: triple-equals
                        part.queryAction == this._query.where ||
                        // tslint:disable-next-line: triple-equals
                        part.queryAction == this._query.andWhere ||
                        // tslint:disable-next-line: triple-equals
                        part.queryAction == this._query.orWhere
                    )
                ) || (
                    // or a join condition:
                    this._queryWhereType === QueryWhereType.Joined && (
                        // tslint:disable-next-line: triple-equals
                        part.queryAction == this._query.innerJoin
                        // tslint:disable-next-line: triple-equals
                        || part.queryAction == this._query.leftJoin
                        // tslint:disable-next-line: triple-equals
                        || part.queryAction == this._query.leftJoinAndSelect
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

            if (typeof (value) === "string" && (quoteString || joiningString) && !matchCase) {
                value = value.toLowerCase();
                joinCondition = `LOWER(${joinCondition})`;
            }
            else if (value instanceof Date) {
                value = `'${value.toISOString()}'`;
            }

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

            if (typeof (value) === "string" && (quoteString || joiningString) && !matchCase) {
                value = value.toLowerCase();
                where = `LOWER(${where})`;
            }
            else if (value instanceof Date) {
                value = `'${value.toISOString()}'`;
            }

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

    private escapeStringArray(array: string[]): void {
        array.forEach((value, i) => {
            if (typeof (value) === "string") {
                array[i] = `'${value}'`;
            }
        });
    }

    private includeOrExcludeFromInnerQuery<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQueryInternal<TI, RI, PI1>, operator: string): IQuery<T, R, P> {
        innerQuery.queryParts.unshift(new QueryBuilderPart(
            innerQuery.query.select, [innerQuery.selected]
        ));

        // Use <any> since all that matters is that the base type of any query contains a property named "id".
        const query: string = this.buildQuery(<any>innerQuery)
            .getQuery();
        this.completeWhere(operator, `(${query})`, { quoteString: false });

        return this;
    }

    private includePropertyUsingAlias<S extends Object>(propertySelector: (obj: T | P) => JoinedEntityType<S>, queryAlias: string): IQuery<T, R, S> {
        return this.joinOrIncludePropertyUsingAlias(propertySelector, queryAlias, this._query.leftJoinAndSelect);
    }

    private isolatedConditions<IP, IS>(
        conditions: (query: IQuery<T, R, P>) => IQuery<T, R, IS>,
        conditionAction: (...params: any[]) => SelectQueryBuilder<T>
    ): IQuery<T, R, IP> {
        const query: Query<T, R, IS> = <Query<T, R, IS>>conditions(<IQuery<T, R, P>>new Query(
            this._query,
            this._getAction,
            this._includeAliasHistory
        ));

        // Do not include joins in bracketed condition; perform those in the outer query.
        const conditionParts: IQueryBuilderPart<T>[] =
            query
                .queryParts
                .filter(qp =>
                    // tslint:disable-next-line: triple-equals
                    qp.queryAction == query.query.where
                    // tslint:disable-next-line: triple-equals
                    || qp.queryAction == query.query.andWhere
                    // tslint:disable-next-line: triple-equals
                    || qp.queryAction == query.query.orWhere
                );

        // Perform joins in the outer query.
        const joinParts: IQueryBuilderPart<T>[] =
            query
                .queryParts
                .filter(qp => conditionParts.indexOf(qp) < 0);
        this._queryParts.push(...joinParts);

        this._queryParts.push(new QueryBuilderPart(
            conditionAction,
            [
                new Brackets(qb => {
                    this.compileQueryParts(conditionParts, qb);
                })
            ]
        ));

        return <IQuery<T, R, IP>><any>this;
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

    private joinMultipleProperties(
        whereProperties: string,
        joinAction: (...params: any[]) => SelectQueryBuilder<T> = this._query.innerJoin
    ): string {
        // Array.map() is used to select a property from a relationship collection.
        // .where(x => x.relationshipOne.map(y => y.relationshipTwo.map(z => z.relationshipThree)))...
        // Becomes, via ts-simple-nameof...
        // "relationshipOne.map(y => y.relationshipTwo.map(z => z.relationshipThree))"
        // Now get...
        // "relationshipOne.map(y=>y.relationshipTwo.map(z=>z.relationshipThree))"
        whereProperties = whereProperties.replace(/ /g, "");
        // "relationshipOne.relationshipTwo.relationshipThree"
        whereProperties = whereProperties
            .replace(/\.map\(([a-zA-Z0-9_]+)=>[a-zA-Z0-9]+/g, "")
            .replace(/\)/g, "");

        const separatedProperties: string[] = whereProperties.split(".");
        const whereProperty: string = separatedProperties.pop();

        for (let property of separatedProperties) {
            // Array.map() is used to select a property from a relationship collection.
            if (property.indexOf("map(") === 0) {
                property = property.substring(4);
            }

            this.joinPropertyUsingAlias(property, this._lastAlias, joinAction);
        }

        return whereProperty;
    }

    private joinOrIncludePropertyUsingAlias<S extends Object>(
        propertySelector: ((obj: T | P) => JoinedEntityType<S>) | string,
        queryAlias: string,
        queryAction: (...params: any[]) => SelectQueryBuilder<T>
    ): IQuery<T, R, S> {
        let propertyName: string = null;

        if (propertySelector instanceof Function) {
            propertyName = nameof<P>(propertySelector);
        }
        else {
            propertyName = propertySelector;
        }

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

    private joinPropertyUsingAlias<S extends Object>(
        propertySelector: ((obj: T | P) => JoinedEntityType<S>) | string,
        queryAlias: string,
        queryAction: (...params: any[]) => SelectQueryBuilder<T> = this._query.innerJoin
    ): IQuery<T, R, S> {
        return this.joinOrIncludePropertyUsingAlias(propertySelector, queryAlias, queryAction);
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
