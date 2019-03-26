import { SelectQueryBuilder } from "typeorm";
import { EntityBase } from "../../types/EntityBase";
import { IQuery } from "./IQuery";
import { IQueryBuilderPart } from "./IQueryBuilderPart";

/**
 * Contains properties used internally by the Query class to construct TypeORM QueryBuilder queries from Queries.
 */
export interface IQueryInternal<T extends EntityBase, R extends T | T[], P = T> extends IQuery<T, R, P> {
    /**
     * Gets the underlying SelectQueryBuilder represented by the Query. Normally only used internally by the Query class for innery Queries.
     */
    query: SelectQueryBuilder<T>;
    /**
     * Gets the QueryParts used by the Query for the SelectQueryBuilder. Normally only used internally by the Query class for innery Queries.
     */
    queryParts: IQueryBuilderPart<T>[];
    /**
     * Gets the underlying database action used by the Query's SelectQueryBuilder. Normally only used internally by the Query class for innery Queries.
     */
    getAction(): Promise<R>;
}
