import { IComparableQuery } from "./IComparableQuery";
import { IFromQuery } from "./IFromQuery";
import { IQueryBase } from "./IQueryBase";
import { IQueryBuilderPart } from "./IQueryBuilderPart";
import { SelectQueryBuilder } from "typeorm/query-builder/SelectQueryBuilder";

export interface IQuery<T extends { id: number }, R = T | T[], P = T> extends IQueryBase<T, R, P> {
    /**
     * Joins an unrelated table using a TypeORM entity.
     * @param foreignEntity The TypeORM entity whose table to join.
     */
    from<F extends { id: number }>(foreignEntity: { new (...params: any[]): F; }): IFromQuery<T, R, F>;
    /**
     * Filters the query with a conditional statement based on the query's base type.
     * @param propertySelector Property selection lambda for property to compare.
     * @param subPropertySelector Optional navigation property on which to perform an inner join.
     */
    where<S extends Object>(propertySelector: (obj: T) => S, subPropertySelector?: (obj: S) => any): IComparableQuery<T, R, T>;
}