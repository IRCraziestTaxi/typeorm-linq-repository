import { IComparableQuery } from "./IComparableQuery";
import { IComparableQueryBase } from "./IComparableQueryBase";
import { IJoinedComparableQuery } from "./IJoinedComparableQuery";
import { IJoinedQuery } from "./IJoinedQuery";

// TODO: Review the return types of these methods.
/**
 * Finalizes the comparison portion of a Query operation and returns, upon completion of comparison, a query whose current selected property type matches the last property type that was joined or included.
 */
export interface IJoinComparableQuery<T extends { id: number }, R extends T | T[], P = T> extends IComparableQueryBase<T, IJoinedQuery<T, R, P>, R, P> {
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @type {F} The type of the foreign entity to join.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new (...params: any[]): F; }): IJoinedComparableQuery<T, R, F>;
    /**
     * Joins the specified navigation property for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    join<S extends Object>(propertySelector: (obj: T) => S | S[]): IJoinedComparableQuery<T, R, S>;
    /**
     * Joins a subsequent navigation property on the previously joined relationship of type P for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoin<S extends Object>(propertySelector: (obj: P) => S | S[]): IJoinedComparableQuery<T, R, S>;
}