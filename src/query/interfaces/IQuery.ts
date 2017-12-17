import { IComparableQuery } from "./IComparableQuery";
import { IJoinedQuery } from "./IJoinedQuery";
import { IQueryBase } from "./IQueryBase";
import { IQueryBuilderPart } from "./IQueryBuilderPart";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";

/**
 * Basic query operations for Queries that are not in Comparable mode.
 */
export interface IQuery<T extends { id: number }, R = T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @type {F} The type of the foreign entity to join.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new (...params: any[]): F; }): IJoinedQuery<T, R, F>;
    /**
     * Filters the query with a conditional statement based on the query's base type.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to compare.
     */
    where<S extends Object>(propertySelector: (obj: T) => S): IComparableQuery<T, R, T>;
}