import { ISelectQuery } from "./ISelectQuery";

export interface ISelectQueryInternal<T extends { id: number }, R = T | T[], P = T> extends ISelectQuery<T, R, P> {
    /**
     * Gets the propert that was selected from a Query to produce an ISelectQuery. Normally only used internally by the Query class for inner Queries.
     */
    selected: string;
}