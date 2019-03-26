import { DeleteResult, getConnectionManager, Repository, SelectQueryBuilder } from "typeorm";
import { IQuery } from "../query/interfaces/IQuery";
import { Query } from "../query/Query";
import { EntityBase } from "../types/EntityBase";
import { EntityConstructor } from "../types/EntityConstructor";
import { RepositoryOptions } from "../types/RepositoryOptions";
import { ILinqRepository } from "./interfaces/ILinqRepository";

/**
 * Base repository operations for TypeORM entities.
 */
export class LinqRepository<T extends EntityBase> implements ILinqRepository<T> {
    protected readonly _repository: Repository<T>;

    private readonly _autoGenerateId: boolean;

    /**
     * Constructs the repository for the specified entity with, unless otherwise specified, a property named "id" that is auto-generated.
     * @param entityType The entity whose repository to create.
     * @param options Options for setting up the repository.
     */
    public constructor(entityType: EntityConstructor<T>, options?: RepositoryOptions) {
        let autoGenerateId: boolean = true;
        let connectionName: string;

        if (options) {
            if (typeof (options.autoGenerateId) === "boolean") {
                autoGenerateId = options.autoGenerateId;
            }
            if (options.connectionName) {
                connectionName = options.connectionName;
            }
        }

        this._repository = getConnectionManager()
            .get(connectionName)
            .getRepository<T>(entityType);
        this._autoGenerateId = autoGenerateId;
    }

    public get query(): IQuery<T, T | T[]> {
        const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder("entity");
        const query: IQuery<T, T[]> = new Query(
            queryBuilder,
            // Get action is not known yet; user will call a get action
            // (count, getMany, or getOne) on the returned query.
            null
        );

        return query;
    }

    public create<E extends T | T[]>(entities: E): Promise<E> {
        if (this._autoGenerateId) {
            // Set "id" to undefined in order to allow auto-generation.
            if (entities instanceof Array) {
                for (const entity of (<T[]>entities)) {
                    entity.id = undefined;
                }
            }
            else {
                (<T>entities).id = undefined;
            }
        }

        return this.update(entities);
    }

    public createQueryBuilder(alias: string): SelectQueryBuilder<T> {
        return this._repository.createQueryBuilder(alias);
    }

    public delete(entities: number | string | T | T[]): Promise<boolean> {
        let deletePromise: Promise<DeleteResult | T | T[]> = null;

        if (typeof (entities) === "number" || typeof (entities) === "string") {
            deletePromise = this._repository.delete(entities);
        }
        else {
            deletePromise = this._repository.remove(<any>entities);
        }

        return deletePromise.then(() => {
            return Promise.resolve(true);
        });
    }

    public getAll(): IQuery<T, T[]> {
        const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder("entity");
        const query: IQuery<T, T[]> = new Query(
            queryBuilder,
            queryBuilder.getMany
        );

        return query;
    }

    public getById(id: number | string): IQuery<T, T> {
        const alias: string = "entity";
        let queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(alias);
        queryBuilder = queryBuilder.where(`${alias}.id = :id`, { id });
        const query: IQuery<T, T> = new Query(
            queryBuilder,
            queryBuilder.getOne
        );

        return query;
    }

    public getOne(): IQuery<T, T> {
        const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder("entity");
        const query: IQuery<T, T> = new Query(
            queryBuilder,
            queryBuilder.getOne
        );

        return query;
    }

    public update<E extends T | T[]>(entities: E): Promise<E> {
        return <Promise<E>>this._repository.save(<any>entities);
    }
}
