import { IComparableQuery } from "./IComparableQuery";
import { IQueryBase } from "./IQueryBase";

/**
 * Basic query operations for Queries that are not in Comparable mode.
 */
export interface IQuery<T extends { id: number }, R = T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Filters the query with a conditional statement based on the query's base type.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to compare.
     */
    where<S extends Object>(propertySelector: (obj: T) => S): IComparableQuery<T, R, T>;
}