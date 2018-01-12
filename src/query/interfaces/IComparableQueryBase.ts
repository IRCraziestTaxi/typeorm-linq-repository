import { IQueryBase } from "./IQueryBase";
import { ISelectQuery } from "./ISelectQuery";

/**
 * Finalizes the comparing portion of a Query operation by performing a basic comparison.
 */
export interface IComparableQueryBase<T extends { id: number }, Q extends IQueryBase<T, R, P>, R extends T | T[], P = T> {
    /**
     * Finds results where the specified property starts with the provided string (using LIKE "string%").
     */
    beginsWith(value: string): Q;
    /**
     * Finds results where the specified property contains the provided string (using LIKE "%string%").
     */
    contains(value: string): Q;
    /**
     * Finds results where the specified property ends with the provided string (using LIKE "%string").
     */
    endsWith(value: string): Q;
    /**
     * Determines whether the previously selected property is equal to the specified value.
     * @param value The value against which to compare.
     */
    equal(value: string | number | boolean): Q;
    /**
    /**
     * Determines whether the previously selected property is greater than the specified value.
     * @param value The value against which to compare.
     */
    greaterThan(value: number): Q;
    /**
     * Determines whether the previously selected property is greater than or equal to the specified value.
     * @param value The value against which to compare.
     */
    greaterThanOrEqual(value: number): Q;
    /**
     * Determines whether the previously selected value is contained in the specified array of values.
     * @param include The array of values to check for inclusion of the previously selected value.
     */
    in(include: string[] | number[]): Q;
    /**
     * Determines whether the previously selected value is contained in the result of values selected from an inner query.
     * @type {TI} The base type of the inner Query.
     * @type {RI} The return type of the inner Query.
     * @type {PI1} The type of the last joined navigation property from the inner Query.
     * @type {PI2} The type of the joined navigation property from which a property was selected in the inner Query.
     * @param innerQuery The inner query from which to select the specified value.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    inSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI, PI2 = TI>(innerQuery: IQueryBase<TI, RI, PI1>, selectFromInnerQuery: ISelectQuery<TI, RI, PI2>): Q;
    /**
     * Determines whether the previously selected property is false.
     * @param value The value to check for falsity.
     */
    isFalse(): Q;
    /**
     * Determines whether the previously selected property is true.
     * @param value The value to check for truth.
     */
    isTrue(): Q;
    /**
     * Determines whether the previously selected property is less than the specified value.
     * @param value The value against which to compare.
     */
    lessThan(value: number): Q;
    /**
     * Determines whether the previously selected property is less than or equal to the specified value.
     * @param value The value against which to compare.
     */
    lessThanOrEqual(value: number): Q;
    /**
     * Determines whether the previously selected property differs from the specified value.
     * @param value The value against which to compare.
     */
    notEqual(value: string | number | boolean): Q;
    /**
     * Determines whether the previously selected value is not contained in the specified array of values.
     * @param include The array of values to check for exclusion of the previously selected value.
     */
    notIn(exclude: string [] | number[]): Q;
    /**
     * Determines whether the previously selected value is not contained in the result of values selected from an inner query.
     * @type {TI} The base type of the inner Query.
     * @type {RI} The return type of the inner Query.
     * @type {PI1} The type of the last joined navigation property from the inner Query.
     * @type {PI2} The type of the joined navigation property from which a property was selected in the inner Query.
     * @param innerQuery The inner query from which to select the specified property.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    notInSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI, PI2 = TI>(innerQuery: IQueryBase<TI, RI, PI1>, selectFromInnerQuery: ISelectQuery<TI, RI, PI2>): Q;
    /**
     * Finds results where the specified property is not null.
     */
    notNull(): Q;
    /**
     * Finds results where the specified property is null.
     */
    null(): Q;
}