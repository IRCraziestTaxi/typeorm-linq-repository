import { EntityBase } from "../../types/EntityBase";
import { QueryOrderOptions } from "../../types/QueryOrderOptions";
import { JoinedEntityType } from "../../types/JoinedEntityType";
import { IComparableQuery } from "./IComparableQuery";
import { IJoinedQuery } from "./IJoinedQuery";
import { IQuery } from "./IQuery";

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
     * Gets the count of results matching the current query conditions.
     */
    count(): Promise<number>;
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @type {F} The type of the foreign entity to join.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new(...params: any[]): F; }): IJoinedQuery<T, R, F>;
    /**
     * Includes the specified navigation property in the queried results.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     */
    include<S>(propertySelector: (obj: T) => JoinedEntityType<S>): IQuery<T, R, S>;
    /**
     * Isolates a group of conditions into one AND clause.
     * @param and The Query representing the AND conditions to group.
     */
    isolatedAnd<S extends Object>(and: (query: IQuery<T, R, P>) => IQuery<T, R, S>): IQuery<T, R, P>;
    /**
     * Isolates a group of conditions into one OR clause.
     * @param or The Query representing the OR conditions to group.
     */
    isolatedOr<S extends Object>(or: (query: IQuery<T, R, P>) => IQuery<T, R, S>): IQuery<T, R, P>;
    /**
     * Joins the specified navigation property using an INNER JOIN
     * (thus excluding results from the joining entity if its joined relationship fails the next join condition)
     * without including it in the results (useful for subsequent join conditions).
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => JoinedEntityType<S>): IJoinedQuery<T, R, S>;
    /**
     * Joins the specified navigation property using a LEFT JOIN
     * (thus including results from the joining entity even if its joined relationship fails the next join condition)
     * without including it in the results (useful for subsequent join conditions).
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    joinAlso<S extends Object>(propertySelector: (obj: T) => JoinedEntityType<S>): IJoinedQuery<T, R, S>;
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
    orderBy(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P>;
    /**
     * Orders the query on the specified property in descending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     */
    orderByDescending(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P>;
    /**
     * Returns the query back to its base type while also exiting "join mode",
     * thus ending a join chain so that where conditions may be continued on the base type.
     */
    reset(): IQuery<T, R, T>;
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
    thenBy(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P>;
    /**
     * Adds a subsequent ordering to the query on the specified property in descending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     */
    thenByDescending(propertySelector: (obj: P) => any, options?: QueryOrderOptions): IQuery<T, R, P>;
    /**
     * Includes a subsequent navigation property in the previously included relationship of type P.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     */
    thenInclude<S extends Object>(propertySelector: (obj: P) => JoinedEntityType<S>): IQuery<T, R, S>;
    /**
     * Joins a subsequent navigation property on the previously joined relationship of type P
     * (thus excluding results from the joining entity if its joined relationship fails the next join condition)
     * without including it in the results (useful for subsequent join conditions).
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoin<S extends Object>(propertySelector: (obj: P) => JoinedEntityType<S>): IJoinedQuery<T, R, S>;
    /**
     * Joins a subsequent navigation property on the previously joined relationship of type P using a LEFT JOIN
     * (thus including results from the joining entity even if its joined relationship fails the next join condition)
     * without including it in the results (useful for subsequent join conditions).
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoinAlso<S extends Object>(propertySelector: (obj: P) => JoinedEntityType<S>): IJoinedQuery<T, R, S>;
    /**
     * Invokes and returns the Promise to get the underlying QueryBuilder's results.
     */
    toPromise(): Promise<R>;
    /**
     * Returns the "current query type" to the base type WITHOUT resetting join chains.
     * Therefore, does NOT allow where conditions to be continued on the base type,
     * but rather uses the base type in the current join chain.
     * @deprecated WARNING: This method was found to be faulty based on its initial intended use,
     * but remains nonetheless in case its use is, in fact, desired.
     * However, you may be looking for **reset()** instead.
     *
     * This method will remain deprecated for a while to alert users who used it based on
     * the initially intended use that it may result in unexpected behavior.
     * The deprecated status will be removed later so that users using it
     * based on the results it actually produces are not annoyed by it.
     */
    usingBaseType(): IQuery<T, R, T>;
}
