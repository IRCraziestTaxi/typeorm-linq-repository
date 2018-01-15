import { IComparableQueryBase } from "./IComparableQueryBase";
import { IJoinedComparableQuery } from "./IJoinedComparableQuery";
import { IQuery } from "./IQuery";
import { IQueryBase } from "./IQueryBase";
import { ISelectQuery } from "./ISelectQuery";

/**
 * Finalizes the comparison portion of a Query operation or joins a relation or foreign entity against which to compare a value.
 */
export interface IComparableQuery<T extends { id: number }, R extends T | T[], P = T> extends IComparableQueryBase<T, R, P> {
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
    from<F extends { id: number }>(foreignEntity: { new(...params: any[]): F; }): IJoinedComparableQuery<T, R, F>;
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
     * @type {TI} The base type of the inner Query.
     * @type {RI} The return type of the inner Query.
     * @type {PI1} The type of the last joined navigation property from the inner Query.
     * @type {PI2} The type of the joined navigation property from which a property was selected in the inner Query.
     * @param innerQuery The inner query from which to select the specified value.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    inSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI, PI2 = TI>(innerQuery: IQueryBase<TI, RI, PI1>, selectFromInnerQuery: ISelectQuery<TI, RI, PI2>): IQuery<T, R, P>;
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
    lessThan(value: number): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected property is less than or equal to the specified value.
     * @param value The value against which to compare.
     */
    lessThanOrEqual(value: number): IQuery<T, R, P>;
    /**
     * Joins the specified navigation property for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => S | S[]): IJoinedComparableQuery<T, R, S>;
    /**
     * Determines whether the previously selected property differs from the specified value.
     * @param value The value against which to compare.
     */
    notEqual(value: string | number | boolean): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is not contained in the specified array of values.
     * @param include The array of values to check for exclusion of the previously selected value.
     */
    notIn(exclude: string[] | number[]): IQuery<T, R, P>;
    /**
     * Determines whether the previously selected value is not contained in the result of values selected from an inner query.
     * @type {TI} The base type of the inner Query.
     * @type {RI} The return type of the inner Query.
     * @type {PI1} The type of the last joined navigation property from the inner Query.
     * @type {PI2} The type of the joined navigation property from which a property was selected in the inner Query.
     * @param innerQuery The inner query from which to select the specified property.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    notInSelected<TI extends { id: number }, RI extends TI | TI[], PI1 = TI, PI2 = TI>(innerQuery: IQueryBase<TI, RI, PI1>, selectFromInnerQuery: ISelectQuery<TI, RI, PI2>): IQuery<T, R, P>;
}