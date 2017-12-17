import { IQuery } from "./IQuery";
import { IQueryBuilderPart } from "./IQueryBuilderPart";
import { SelectQueryBuilder } from "typeorm";

/**
 * Contains properties used internally by the Query class to construct TypeORM QueryBuilder queries from Queries.
 */
export interface IQueryInternal<T extends { id: number }, R = T | T[], P = T> extends IQuery<T, R, P> {
    /**
     * Gets the underlying database action used by the Query"s SelectQueryBuilder. Normally only used internally by the Query class for innery Queries.
     */
    getAction: () => Promise<R>;
    /**
     * Gets the underlying initial alias used by the Query"s SelectQueryBuilder. Normally only used internally by the Query class for inner Queries.
     */
    initialAlias: string;
    /**
     * Gets the underlying SelectQueryBuilder represented by the Query. Normally only used internally by the Query class for innery Queries.
     */
    query: SelectQueryBuilder<T>;
    /**
     * Gets the QueryParts used by the Query for the SelectQueryBuilder. Normally only used internally by the Query class for innery Queries.
     */
    queryParts: IQueryBuilderPart<T>[];
}