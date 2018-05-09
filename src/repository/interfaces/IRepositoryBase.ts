import { IQuery } from "../../query/interfaces/IQuery";
import { EntityBase } from "../../types/EntityBase";
import { ObjectLiteral, SelectQueryBuilder } from "typeorm";

/**
 * Base repository operations for TypeORM entities.
 */
export interface IRepositoryBase<T extends EntityBase> {
    /**
     * Creates one or more entities in the database.
     * @param entities The entity or entities to create.
     */
    create<E extends T | T[]>(entities: E): Promise<E>;
    /**
     * Gets an instance of a QueryBuilder (useful if the Query returned by this repository does not meet your needs yet).
     */
    createQueryBuilder(alias: string): SelectQueryBuilder<T>;
    /**
     * Deletes one or more entities from the database.
     * @param entities The entity or entities to delete or the ID of the entity to delete.
     */
    delete(entities: number | T | T[]): Promise<boolean>;
    /**
     * Returns a Query returning a set of results.
     */
    getAll(): IQuery<T, T[]>;
    /**
     * Finds one entity with the specified ID.
     * @param id The ID of the entity to find.
     */
    getById(id: number): IQuery<T, T>;
    /**
     * Returns a Query returning one entity.
     */
    getOne(): IQuery<T, T>;
    /**
     * Updates one or more entities in the database.
     * @param entities The entity or entities to update.
     */
    update<E extends T | T[]>(entities: E): Promise<E>;
}