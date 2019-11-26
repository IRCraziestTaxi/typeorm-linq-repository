import { nameof } from "ts-simple-nameof";
import { EntitySchema, getConnectionManager, Repository, SelectQueryBuilder } from "typeorm";
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
    private readonly _primaryKeyName: string;

    /**
     * Constructs the repository for the specified entity with, unless otherwise specified,
     * a primry key named "id" that is auto-generated.
     * @param entityType The entity whose repository to create.
     * @param options Options for setting up the repository.
     */
    public constructor(
        entityType: EntityConstructor<T> | EntitySchema<T>,
        options?: RepositoryOptions<T>
    ) {
        let autoGenerateId: boolean = true;
        let connectionName: string;
        let primaryKeyName: string = "id";

        if (options) {
            if (typeof (options.autoGenerateId) === "boolean") {
                autoGenerateId = options.autoGenerateId;
            }

            if (options.connectionName) {
                connectionName = options.connectionName;
            }

            if (options.primaryKey) {
                primaryKeyName = nameof(options.primaryKey);
            }
        }

        this._repository = getConnectionManager()
            .get(connectionName)
            .getRepository<T>(entityType);
        this._autoGenerateId = autoGenerateId;
        this._primaryKeyName = primaryKeyName;
    }

    public get typeormRepository(): Repository<T> {
        return this._repository;
    }

    public async create<E extends T | T[]>(entities: E): Promise<E> {
        if (this._autoGenerateId) {
            // Set "id" to undefined in order to allow auto-generation.
            if (entities instanceof Array) {
                for (const entity of (<T[]>entities)) {
                    // Not sure what is going on with this...
                    // Even defining EntityBase as { [key: string]: any; }
                    // or even Record<string, any> results in the error
                    // "Type 'string' cannot be used to index type T".
                    // https://github.com/microsoft/TypeScript/issues/31661
                    (<Record<string, any>>entity)[this._primaryKeyName] = undefined;
                }
            }
            else {
                // Not sure what is going on with this...
                // Even defining EntityBase as { [key: string]: any; }
                // or even Record<string, any> results in the error
                // "Type 'string' cannot be used to index type T".
                // https://github.com/microsoft/TypeScript/issues/31661
                (<Record<string, any>>entities)[this._primaryKeyName] = undefined;
            }
        }

        return this.upsert(entities);
    }

    public createQueryBuilder(alias: string): SelectQueryBuilder<T> {
        return this._repository.createQueryBuilder(alias);
    }

    public async delete(entities: number | string | T | T[]): Promise<boolean> {
        if (typeof (entities) === "number" || typeof (entities) === "string") {
            await this._repository.delete(entities);
        }
        else {
            await this._repository.remove(<any>entities);
        }

        return true;
    }

    public getAll(): IQuery<T, T[]> {
        const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder("entity");
        const query: IQuery<T, T[]> = new Query(
            queryBuilder, queryBuilder.getMany
        );

        return query;
    }

    public getById(id: number | string): IQuery<T, T> {
        const alias: string = "entity";
        let queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(alias);
        queryBuilder = queryBuilder.where(`${alias}.${this._primaryKeyName} = :id`, { id });
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

    public async update<E extends T | T[]>(entities: E): Promise<E> {
        return this.upsert(entities);
    }

    public async upsert<E extends T | T[]>(entities: E): Promise<E> {
        return <Promise<E>>this._repository.save(<any>entities);
    }
}
