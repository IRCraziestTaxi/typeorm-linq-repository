import { EntityBase } from "../../types/EntityBase";
import { JoinedEntityType } from "../../types/JoinedEntityType";
import { QueryConditionOptions } from "../../types/QueryConditionOptions";
import { IComparableQueryBase } from "./IComparableQueryBase";
import { IJoinedComparableQuery } from "./IJoinedComparableQuery";
import { IQuery } from "./IQuery";
import { ISelectQuery } from "./ISelectQuery";

/**
 * Finalizes the comparison portion of a Query operation or joins a relation or foreign entity against which to compare a value.
 */
export interface IComparableQuery<T extends EntityBase, R extends T | T[], P = T> extends IComparableQueryBase<T, R, P> {
    /**
     * Finds results where the specified property starts with the provided string (using LIKE "string%").
     * @param value The value against which to compare.
     * @param options Options for query conditions such as string case matching.
     */
    beginsWith(value: string, options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Finds results where the specified property contains the provided string (using LIKE "%string%").
     * @param value The value against which to compare.
     * @param options Options for query conditions such as string case matching.
     */
    contains(value: string, options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Finds results where the specified property ends with the provided string (using LIKE "%string").
     * @param value The value against which to compare.
     * @param options Options for query conditions such as string case matching.
     */
    endsWith(value: string, options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is equal to the specified value.
     * @param value The value against which to compare.
     * @param options Options for query conditions such as string case matching.
     */
    equal(value: string | number | boolean | Date, options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @type {F} The type of the foreign entity to join.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new(...params: any[]): F; }): IJoinedComparableQuery<T, R, F>;
    /**
     * Determines whether the previously selected property is greater than the specified value.
     * @param value The value against which to compare.
     */
    greaterThan(value: number | Date): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is greater than or equal to the specified value.
     * @param value The value against which to compare.
     */
    greaterThanOrEqual(value: number | Date): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is contained in the specified array of values.
     * @param include The array of values to check for inclusion of the previously selected value.
     * @param options Options for query conditions such as string case matching.
     */
    in(include: string[] | number[], options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is contained in the result of values selected from an inner query.
     * @type {TI} The base type of the inner Query.
     * @type {RI} The return type of the inner Query.
     * @type {PI1} The type of the last joined navigation property from the inner Query.
     * @param innerQuery The inner query from which to select the specified value.
     */
    inSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQuery<TI, RI, PI1>): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is false.
     * @param value The value to check for falsity.
     */
    isFalse(): IQuery<T, R, P>;
    /**
     * Finds results where the specified property is not null.
     */
    isNotNull(): IQuery<T, R, P>;
    /**
     * Finds results where the specified property is null.
     */
    isNull(): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is true.
     * @param value The value to check for truth.
     */
    isTrue(): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is less than the specified value.
     * @param value The value against which to compare.
     */
    lessThan(value: number | Date): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is less than or equal to the specified value.
     * @param value The value against which to compare.
     */
    lessThanOrEqual(value: number | Date): IQuery<T, R, P>;
    /**
     * Joins the specified navigation property for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => JoinedEntityType<S>): IJoinedComparableQuery<T, R, S>;
    /**
     * Determines whether the previously selected property differs from the specified value.
     * @param value The value against which to compare.
     * @param options Options for query conditions such as string case matching.
     */
    notEqual(value: string | number | boolean, options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is not contained in the specified array of values.
     * @param include The array of values to check for exclusion of the previously selected value.
     * @param options Options for query conditions such as string case matching.
     */
    notIn(exclude: string[] | number[], options?: QueryConditionOptions): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is not contained in the result of values selected from an inner query.
     * @type {TI} The base type of the inner Query.
     * @type {RI} The return type of the inner Query.
     * @type {PI1} The type of the last joined navigation property from the inner Query.
     * @param innerQuery The inner query from which to select the specified property.
     */
    notInSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI>(innerQuery: ISelectQuery<TI, RI, PI1>): IQuery<T, R, P>;
}