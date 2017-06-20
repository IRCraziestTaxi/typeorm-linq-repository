import { IComparableQuery } from "./IComparableQuery";

export interface IQuery<T extends { id: number }, R = T | T[], P = T> {
    /**
     * Adds an additional logical AND condition for which to query results.
     * @param propertySelector Property selection lambda for property to compare.
     * @param alias Optional custom alias to use in the query's where condition.
     */
    and(propertySelector: (obj: P) => any, alias?: string): IComparableQuery<T, R, P>;
    /**
     * Catches an error thrown during the execution of the underlying QueryBuilder's Promise.
     * @param rejected The rejection callback for the error thrown on the underlying QueryBuilder's Promise.
     */
    catch(rejected: (error: any) => void | Promise<any> | IQuery<any, any>): Promise<any>;
    /**
     * Includes the specified navigation property in the queried results.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     * @param alias Optional custom alias to use for subsequent order conditions.
     */
    include<S>(propertySelector: (obj: T) => S | S[], alias?: string): IQuery<T, R, S>;
    /**
     * Includes the specified navigation property in the queried results while filtering included entities on the provided subproperty.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     * @param subPropertySelector Property selection lambda for the subproperty on the included entity on which to filter.
     */
    includeWhere<S extends Object>(propertySelector: (obj: T) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S>;
    /**
     * Adds an additional logical OR condition for which to query results.
     * @param propertySelector Property selection lambda for property to compare.
     * @param alias Optional custom alias to use in the query's where condition.
     */
    or(propertySelector: (obj: P) => any, alias?: string): IComparableQuery<T, R, P>;
    /**
     * Orders the query on the specified property in ascending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     * @param alias Optional custom alias to use for the order property.
     */
    orderBy(propertySelector: (obj: P) => any, alias?: string): IQuery<T, R, P>;
    /**
     * Orders the query on the specified property in descending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     * @param alias Optional custom alias to use for the order property.
     */
    orderByDescending(propertySelector: (obj: P) => any, alias?: string): IQuery<T, R, P>;
    /**
     * Sets the number of results to skip before taking results from the query.
     * @param skip The number of results to skip.
     */
    skip(skip: number): IQuery<T, R>;
    /**
     * Limits the number of results to take from the query.
     * @param limit The number of results to take.
     */
    take(limit: number): IQuery<T, R>;
    /**
     * Executes the query by invoking the Promise to get the underlying QueryBuilder's results.
     * @param resolved The resolution callback for the underlying QueryBuilder's results Promise.
     */
    then(resolved: (results: R) => void | Promise<any> | IQuery<any, any>): Promise<any>;
    /**
     * Adds a subsequent ordering to the query on the specified property in ascending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     * @param alias Optional custom alias to use for the order property.
     */
    thenBy(propertySelector: (obj: P) => any, alias?: string): IQuery<T, R, P>;
    /**
     * Adds a subsequent ordering to the query on the specified property in descending order.
     * @param propertySelector Property selection lambda for property on which to sort.
     * @param alias Optional custom alias to use for the order property.
     */
    thenByDescending(propertySelector: (obj: P) => any, alias?: string): IQuery<T, R, P>;
    /**
     * Includes a subsequent navigation property in the previously included relationship of type P.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     * @param alias Optional alias to use for subsequent order conditions.
     */
    thenInclude<S>(propertySelector: (obj: P) => S | S[], alias?: string): IQuery<T, R, S>;
    /**
     * Includes a subsequent navigation property in the previously included relationship of type P while filtering included entities on the provided subproperty.
     * @param propertySelector Property selection lambda for property to include, ex. x => x.prop
     * @param subPropertySelector Property selection lambda for the subproperty on the included entity on which to filter.
     */
    thenIncludeWhere<S extends Object>(propertySelector: (obj: P) => S[], subPropertySelector: (obj: S) => any): IComparableQuery<T, R, S>;
    /**
     * Invokes and returns the Promise to get the underlying QueryBuilder's results.
     */
    toPromise(): Promise<R>;
    /**
     * Returns the query to its base type; useful, for instance, for setting order by constraints after a sequence of includes transforms the query's current property type.
     */
    usingBaseType(): IQuery<T, R, T>;
    /**
     * Filters the query with a conditional statement.
     * @param propertySelector Property selection lambda for property to compare.
     * @param alias Optional custom alias to use in the query's where condition.
     */
    where(propertySelector: (obj: T) => any, alias?: string): IComparableQuery<T, R, T>;
}