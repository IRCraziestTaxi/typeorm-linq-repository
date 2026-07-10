import { EntityBase } from "../../types/EntityBase";
import { JoinedEntityType } from "../../types/JoinedEntityType";
import { Nullable } from "../../types/Nullable";
import { IJoinedComparableQuery } from "./IJoinedComparableQuery";

/**
 * Enables IComparableQuery and IJoinedComparableQuery to join a relation from the current Query type.
 */
export interface IComparableQueryBase<T extends EntityBase, R extends Nullable<T> | T[], P = T> {
    /**
     * Joins a subsequent navigation property on the previously joined relationship of type P for where conditions on that property.
     * @type {S} The type of the joined navigation property.
     * @param propertySelector Property selection lambda for property to join, ex. x => x.prop
     */
    thenJoin<S extends EntityBase>(propertySelector: (obj: P) => JoinedEntityType<S>): IJoinedComparableQuery<T, R, S>;
}
