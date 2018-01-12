import { IComparableQuery } from "./IComparableQuery";
import { IQueryBase } from "./IQueryBase";

/**
 * Allows .where() to use the last joined entity's alias.
 */
export interface IJoinedQuery<T extends { id: number }, R extends T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Filters the query with a conditional statement based on the last joined entity's type.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to compare.
     */
    where<S extends Object>(propertySelector: (obj: P) => S): IComparableQuery<T, R, P>;
}