import { IComparableQuery } from "./IComparableQuery";
import { IQueryBase } from "./IQueryBase";

export interface IFromQuery<T extends { id: number }, R = T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Filters the query with a conditional statement based on the last joined entity's type.
     * @param propertySelector Property selection lambda for property to compare.
     * @param subPropertySelector Optional navigation property on which to perform an inner join.
     */
    where<S extends Object>(propertySelector: (obj: P) => S, subPropertySelector?: (obj: S) => any): IComparableQuery<T, R, P>;
}