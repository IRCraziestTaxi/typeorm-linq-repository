import { EntityBase } from "../../types/EntityBase";
import { IComparableQuery } from "./IComparableQuery";
import { IJoinedQuery } from "./IJoinedQuery";
import { IQuery } from "./IQuery";
import { IQueryBuilderPart } from "./IQueryBuilderPart";
import { ISelectQuery } from "./ISelectQuery";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";

/**
 * Base set of operations for all Queries that are not in Comparable mode.
 */
export interface IQueryBase<T extends EntityBase, R extends T | T[], P = T> {
    /**
     * Adds an additional logical AND condition for which to query results.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to compare.
     */
    and<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P>;
    /**
     * Catches an error thrown during the execution of the underlying QueryBuilder's Promise.
     * @param rejected The rejection callback for the error thrown on the underlying QueryBuilder's Promise.
     */
    catch(rejected: (error: any) => void | Promise<any> | IQuery<any, any>): Promise<any>;
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @type {F} The type of the foreign entity to join.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new (...params: any[]): F; }): IJoinedQuery<T, R, F>;
    /**
     * Includes the specified navigation property in the queried results.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     */
    include<S>(propertySelector: (obj: T) => S | S[]): IQuery<T, R, S>;
    // /**
    //  * Includes the specified navigation property in the queried results while filtering included entities on the provided subproperty.
    //  * @type {S} The type of the joined navigation property.
    //  * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
    //  * @param subPropertySelector Property selection lambda for the subproperty on the included entity on which to filter.
    //  */
    // includeWhere<S extends Object>(propertySelector: (obj: T) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S>;
    /**
     * Joins the specified navigation property without including it in the results (useful for subsequent join conditions).
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => S | S[]): IJoinedQuery<T, R, S>;
    // /**
    //  * Joins the specified navigation property without including it in the results (useful for subsequent join conditions) while filtering joined entities on the provided subproperty.
    //  * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
    //  * @param subPropertySelector Property selection lambda for the subproperty on the joined entity on which to filter.
    //  */
    // joinWhere<S extends Object>(propertySelector: (obj: T) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S>;
    /**
     * Adds an additional logical OR condition for which to query results.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to compare.
     */
    or<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P>;
    /**
     * Orders the query on the specified property in ascending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     */
    orderBy(propertySelector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Orders the query on the specified property in descending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     */
    orderByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Sets the number of results to skip before taking results from the query.
     * @param skip The number of results to skip.
     */
    skip(skip: number): IQuery<T, R, P>;
    /**
     * Limits the number of results to take from the query.
     * @param limit The number of results to take.
     */
    take(limit: number): IQuery<T, R, P>;
    /**
     * Executes the query by invoking the Promise to get the underlying QueryBuilder's results.
     * @param resolved The resolution callback for the underlying QueryBuilder's results Promise.
     */
    then(resolved: (results: R) => void | Promise<any>): Promise<any>;
    /**
     * Adds a subsequent ordering to the query on the specified property in ascending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     */
    thenBy(propertySelector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Adds a subsequent ordering to the query on the specified property in descending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     */
    thenByDescending(propertySelector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Includes a subsequent navigation property in the previously included relationship of type P.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     */
    thenInclude<S extends Object>(propertySelector: (obj: P) => S | S[]): IQuery<T, R, S>;
    // /**
    //  * Includes a subsequent navigation property in the previously included relationship of type P while filtering included entities on the provided subproperty.
    //  * @type {S} The type of the joined navigation property.
    //  * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
    //  * @param subPropertySelector Property selection lambda for the subproperty on the included entity on which to filter.
    //  */
    // thenIncludeWhere<S extends Object>(propertySelector: (obj: P) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S>;
    /**
     * Joins a subsequent navigation property on the previously joined relationship of type P without including it in the results (useful for subsequent join conditions).
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IJoinedQuery<T, R, S>;
    // /**
    //  * Joins a subsequent navigation property on the previously joined relationship of type P without including it in the results (useful for subsequent join conditions) while filtering joined entities on the provided subproperty.
    //  * @type {S} The type of the joined navigation property.
    //  * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
    //  * @param subPropertySelector Property selection lambda for the subproperty on the joined entity on which to filter.
    //  */
    // thenJoinWhere<S extends Object>(propertySelector: (obj: P) => S | S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S>;
    /**
     * Invokes and returns the Promise to get the underlying QueryBuilder's results.
     */
    toPromise(): Promise<R>;
    /**
     * Returns the query to its base type; useful, for instance, for setting order by constraints after a sequence of includes transforms the query's current property type.
     */
    usingBaseType(): IQuery<T, R, T>;
}