import { ComparableValue } from "../../types/ComparableValue";
import { EntityBase } from "../../types/EntityBase";
import { JoinedEntityType } from "../../types/JoinedEntityType";
import { Nullable } from "../../types/Nullable";
import { IComparableQuery } from "./IComparableQuery";
import { IQueryBase } from "./IQueryBase";
import { ISelectQuery } from "./ISelectQuery";

/**
 * Basic query operations for Queries that are not in Comparable mode.
 */
export interface IQuery<T extends EntityBase, R extends Nullable<T> | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Checks whether any items exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    andAny<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether any items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    andAny<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Checks whether no items exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    andNone<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether no items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare.
     */
    andNone<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Isolates a group of conditions into one WHERE clause.
     * @param where The Query representing the WHERE conditions to group.
     */
    isolatedWhere<S extends EntityBase>(where: (query: IQuery<T, R, T>) => IQuery<T, R, S>): IQuery<T, R, T>;
    /**
     * Checks whether any items exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    orAny<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether any items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare.
     */
    orAny<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Checks whether no items exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    orNone<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether no items that meet certain criteria exist in the specified relationship (used after whereNone or whereAny).
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    orNone<S extends EntityBase>(
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
    where<S extends EntityBase>(propertySelector: (obj: T) => S): IComparableQuery<T, R, T>;
    /**
     * Checks whether any items exist in the specified relationship.
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    whereAny<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether any items that meet certain criteria exist in the specified relationship.
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare.
     */
    whereAny<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
    /**
     * Checks whether no items exist in the specified relationship.
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     */
    whereNone<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue
    ): IQuery<T, R, T>;
    /**
     * Checks whether no items that meet certain criteria exist in the specified relationship.
     * 
     * NOTE: Using `*Any` or `*None` calls inside of multiple different `isolated*` calls will result in unexpected behavior.
     * Grouping of `*Any` or `*None` calls is not supported at this time.
     * 
     * NOTE: Since this method uses a HAVING clause under the hood,
     * this method may require an arbitrary groupBy call (for instance, the base entity's primary key).
     * @param relationSelector The relationship to check for items.
     * @param relationCountPropSelector Arbitrary primitive property on which to count relation items.
     * @param conditionPropSelector Property on which to compare
     */
    whereNone<S extends EntityBase>(
        relationSelector: (obj: T) => JoinedEntityType<S>,
        relationCountPropSelector: (obj: S) => ComparableValue,
        conditionPropSelector: (obj: S) => ComparableValue
    ): IComparableQuery<T, R, S>;
}
