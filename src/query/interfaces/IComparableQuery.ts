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
     * Joins an unrelated table using a TypeORM entity.
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
     * @param propertySelector The property in the outer query to include in the selected results of the inner query.
     * @param innerQuery The inner query from which to select the specified value.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    inSelected<S extends Object>(propertySelector: (obj: T) => any, innerQuery: IQuery<T, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P>;
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
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => S | S[]): IComparableQuery<T, R, S>;
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
     * @param propertySelector The property in the outer query to exclude from the selected results of the inner query.
     * @param innerQuery The inner query from which to select the specified property.
     * @param selectFromInnerQuery The property to select from the inner query.
     */
    notInSelected<S extends Object>(propertySelector: (obj: T) => any, innerQuery: IQuery<T, R, S>, selectFromInnerQuery: (obj: S) => any): IQuery<T, R, P>;
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
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IComparableQuery<T, R, S>;
}