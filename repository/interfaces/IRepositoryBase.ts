import { ObjectLiteral, QueryBuilder } from "typeorm";
import { IQuery } from "../../query/interfaces/IQuery";

/**
 * Base repository operations for TypeORM entities.
 */
export interface IRepositoryBase<T extends { id: number }> {
    /**
     * Inserts new entities into the database by ensuring that their IDs are null prior to persistance.
     * @param entities The entities to create.
     */
    createMany(entities: T[]): Promise<T[]>;
    /**
     * Inserts a new entity into the database by ensuring that the ID is null prior to persistance.
     * @param entity The entity to create.
     */
    createOne(entity: T): Promise<T>;
    /**
     * Gets an instance of a QueryBuilder (useful if the Query returned by this repository does not meet your needs yet).
     */
    createQueryBuilder(alias: string): QueryBuilder<T>;
    /**
     * Returns a Query returning a set of results.
     * @param alias Optional alias for subsequent query conditions.
     */
    getAll(alias?: string): IQuery<T, T[]>;
    /**
     * Finds one entity with the specified ID.
     * @param id The ID of the entity to find.
     */
    getById(id: number): IQuery<T, T>;
    /**
     * Returns a Query returning one entity.
     * @param alias Optional alias for subsequent query conditions.
     */
    getOne(alias?: string): IQuery<T, T>;
    /**
     * Persists a set of entities to the database.
     * @param entities The set of entities to persist.
     */
    persistMany(entities: T[]): Promise<T[]>;
    /**
     * Persists one entity to the database.
     * @param entity The entity to persist.
     */
    persistOne(entity: T): Promise<T>;
    /**
     * Removes a set of entities from the database.
     * @param entities The set of entities to remove.
     */
    removeMany(entities: T[]): Promise<T[]>;
    /**
     * Removes one entity from the database.
     * @param entity The entity to remove.
     */
    removeOne(entity: T): Promise<T>;
}