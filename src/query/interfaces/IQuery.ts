import { EntityBase } from "../../types/EntityBase";
import { IComparableQuery } from "./IComparableQuery";
import { IQueryBase } from "./IQueryBase";
import { ISelectQuery } from "./ISelectQuery";

/**
 * Basic query operations for Queries that are not in Comparable mode.
 */
export interface IQuery<T extends EntityBase, R extends T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Selects a property from the last joined entity to select while performing an inner query.
     * @param propertySelector Property selection lambda for the property to select.
     */
    select(propertySelector: (obj: T) => any): ISelectQuery<T, R, T>;
    /**
     * Filters the query with a conditional statement based on the query's base type.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to compare.
     */
    where<S extends Object>(propertySelector: (obj: T) => S): IComparableQuery<T, R, T>;
}