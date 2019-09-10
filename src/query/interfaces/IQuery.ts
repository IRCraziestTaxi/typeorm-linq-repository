import { EntityBase } from "../../types/EntityBase";
import { IComparableQuery } from "./IComparableQuery";
import { IQueryBase } from "./IQueryBase";
import { ISelectQuery } from "./ISelectQuery";
import { JoinedEntityType } from "../../types/JoinedEntityType";
import { ComparableValue } from "../../types/ComparableValue";

/**
 * Basic query operations for Queries that are not in Comparable mode.
 */
export interface IQuery<T extends EntityBase, R extends T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Checks whether any items exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    andAny<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether any items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    andAny<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Checks whether no items exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    andNone<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether no items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    andNone<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Isolates a group of conditions into one WHERE clause.
     * @param where The Query representing the WHERE conditions to group.
     */
    isolatedWhere<S extends Object>(where: (query: IQuery<T, R, T>) => IQuery<T, R, S>): IQuery<T, R, T>;
    /**
     * Checks whether any items exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    orAny<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether any items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    orAny<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Checks whether no items exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    orNone<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether no items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    orNone<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
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
    /**
     * Checks whether any items exist in the specified relationship.
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    whereAny<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether any items that meet certain criteria exist in the specified relationship.
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    whereAny<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Checks whether no items exist in the specified relationship.
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    whereNone<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether no items that meet certain criteria exist in the specified relationship.
     * NOTE: This method requires an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    whereNone<S extends Object>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
}