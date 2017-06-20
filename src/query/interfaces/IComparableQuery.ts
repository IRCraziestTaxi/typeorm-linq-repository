import { IQuery } from "./IQuery";

export interface IComparableQuery<T extends { id: number }, R = T | T[], P = T> {
    /**
     * Finds results where the specified property starts with the provided string (using LIKE 'string%').
     */
    beginsWith(value: string): IQuery<T, R, P>;
    /**
     * Finds results where the specified property contains the provided string (using LIKE '%string%').
     */
    contains(value: string): IQuery<T, R, P>;
    /**
     * Finds results where the specified property ends with the provided string (using LIKE '%string').
     */
    endsWith(value: string): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is equal to the specified value.
     * @param value The value against which to compare.
     */
    equal(value: string | number | boolean): IQuery<T, R, P>;
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
     * Finds results where the specified property is not null.
     */
    notNull(): IQuery<T, R, P>;
    /**
     * Finds results where the specified property is null.
     */
    null(): IQuery<T, R, P>;
}