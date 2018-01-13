import { IComparableQueryBase } from "./IComparableQueryBase";
import { IQuery } from "./IQuery";

/**
 * Finalizes the comparing portion of a Query operation by performing comparison with the specified joined value.
 */
export interface IJoinedComparableQuery<T extends { id: number }, R extends T | T[], P = T> extends IComparableQueryBase<T, R, P> {
    /**
     * Determines whether the property specified in the last "where" is equal to the specified property on the last joined entity.
     * @param selector Property selection lambda for property to compare, ex. x => x.prop
     */
    equalJoined(selector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Determines whether the property specified in the last "where" is less than the specified property on the last joined entity.
     * @param selector Property selection lambda for property to compare, ex. x => x.prop
     */
    greaterThanJoined(selector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Determines whether the property specified in the last "where" is greater than or equal to the specified property on the last joined entity.
     * @param selector Property selection lambda for property to compare, ex. x => x.prop
     */
    greaterThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Determines whether the property specified in the last "where" is less than the specified property on the last joined entity.
     * @param selector Property selection lambda for property to compare, ex. x => x.prop
     */
    lessThanJoined(selector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Determines whether the property specified in the last "where" is less than or equal to the specified property on the last joined entity.
     * @param selector Property selection lambda for property to compare, ex. x => x.prop
     */
    lessThanOrEqualJoined(selector: (obj: P) => any): IQuery<T, R, P>;
    /**
     * Determines whether the property specified in the last "where" is not equal to the specified property on the last joined entity.
     * @param selector Property selection lambda for property to compare, ex. x => x.prop
     */
    notEqualJoined(selector: (obj: P) => any): IQuery<T, R, P>;
}