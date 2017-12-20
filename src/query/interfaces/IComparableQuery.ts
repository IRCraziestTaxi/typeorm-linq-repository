import { IJoinedComparableQuery } from "./IJoinedComparableQuery";
import { IQuery } from "./IQuery";

/**
 * Finalizes the comparing portion of a Query operation by performing a basic comparison.
 */
export interface IComparableQuery<T extends { id: number }, R = T | T[], P = T> {
    /**
     * Finds results where the specified property starts with the provided string (using LIKE "string%").
     */
    beginsWith(value: string): IQuery<T, R, P>;
    /**
     * Finds results where the specified property contains the provided string (using LIKE "%string%").
     */
    contains(value: string): IQuery<T, R, P>;
    /**
     * Finds results where the specified property ends with the provided string (using LIKE "%string").
     */
    endsWith(value: string): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is equal to the specified value.
     * @param value The value against which to compare.
     */
    equal(value: string | number | boolean): IQuery<T, R, P>;
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @type {F} The type of the foreign entity to join.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new (...params: any[]): F; }): IComparableQuery<T, R, F>;
    /**
     * Determines whether the previously selected property is greater than the specified value.
     * @param value The value against which to compare.
     */
    greaterThan(value: number): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is greater than or equal to the specified value.
     * @param value The value against which to compare.
     */
    greaterThanOrEqual(value: number): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is contained in the specified array of values.
     * @param include The array of values to check for inclusion of the previously selected value.
     */
    in(include: string[] | number[]): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is contained in the result of values selected from an inner query.
     * @type {I} The base type of the inner Query.
     * @type {S} The type of the joined navigation property from the inner query.
     * @param innerQuery The inner query from which to select the specified value.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    // TODO: selectFromInnerQuery should not use type S as its entity type.
    inSelected<I extends { id: number }, S extends Object>(innerQuery: IQuery<I, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is false.
     * @param value The value to check for falsity.
     */
    isFalse(): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is true.
     * @param value The value to check for truth.
     */
    isTrue(): IQuery<T, R, P>;
    /**
     * Joins the specified navigation property for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => S | S[]): IJoinedComparableQuery<T, R, S>;
    /**
     * Determines whether the previously selected property is less than the specified value.
     * @param value The value against which to compare.
     */
    lessThan(value: number): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is less than or equal to the specified value.
     * @param value The value against which to compare.
     */
    lessThanOrEqual(value: number): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property differs from the specified value.
     * @param value The value against which to compare.
     */
    notEqual(value: string | number | boolean): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is not contained in the specified array of values.
     * @param include The array of values to check for exclusion of the previously selected value.
     */
    notIn(exclude: string [] | number[]): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is not contained in the result of values selected from an inner query.
     * @type {I} The base type of the inner Query.
     * @type {S} The type of the joined navigation property from the inner query.
     * @param innerQuery The inner query from which to select the specified property.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    // TODO: selectFromInnerQuery should not use type S as its entity type.
    notInSelected<I extends { id: number }, S extends Object>(innerQuery: IQuery<I, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P>;
    /**
     * Finds results where the specified property is not null.
     */
    notNull(): IQuery<T, R, P>;
    /**
     * Finds results where the specified property is null.
     */
    null(): IQuery<T, R, P>;
    /**
     * Joins a subsequent navigation property on the previously joined relationship of type P for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IJoinedComparableQuery<T, R, S>;
}