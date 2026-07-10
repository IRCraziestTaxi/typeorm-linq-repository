import { EntityBase } from "../../types/EntityBase";
import { Nullable } from "../../types/Nullable";

/**
 * Used to select the desired propery from the desired entity when using an inner query.
 * No further methods may be used after selecting a property because this interface is meant to serve just that purpose.
 */
export interface ISelectQuery<T extends EntityBase, R extends Nullable<T> | T[], P = T> {
}
