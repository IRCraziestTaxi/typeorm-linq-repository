import { EntityBase } from "../../types/EntityBase";

/**
 * A query that may be selected from after conditions and operators
 * rather than before, allowing for reusable queries.
 */
export interface IQueryableQuery<T extends EntityBase> {
    /**
     * Returns the number of results matching the current query conditions.
     */
    count(): Promise<number>;
    /**
     * Gets many results matching the current query conditions.
     */
    getMany(): Promise<T[]>;
    /**
     * Gets the first result matching the current query conditions.
     */
    getOne(): Promise<T>;
}
