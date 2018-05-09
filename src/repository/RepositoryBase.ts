import { IQuery } from "../query/interfaces/IQuery";
import { Query } from "../query/Query";
import { EntityBase } from "../types/EntityBase";
import { IRepositoryBase } from "./interfaces/IRepositoryBase";
import { DeleteResult, getConnectionManager, Repository, SelectQueryBuilder } from "typeorm";

/**
 * Base repository operations for TypeORM entities.
 */
export abstract class RepositoryBase<T extends EntityBase> implements IRepositoryBase<T> {
    protected readonly _repository: Repository<T>;

    public constructor(entityType: { new(...params: any[]): T; }) {
        this._repository = getConnectionManager().get().getRepository<T>(entityType);
    }

    public create<E extends T | T[]>(entities: E): Promise<E> {
        if (entities instanceof Array) {
            for (let entity of (<T[]>entities)) {
                // For GUID IDs, do not set to undefined to support auto-generated IDs.
                if (typeof (entity.id) !== "string") {
                    entity.id = undefined;
                }
            }
        }
        else {
            // For GUID IDs, do not set to undefined to support auto-generated IDs.
            if (typeof ((<T>entities).id) !== "string") {
                (<T>entities).id = undefined;
            }
        }

        return this.update(entities);
    }

    public createQueryBuilder(alias: string): SelectQueryBuilder<T> {
        return this._repository.createQueryBuilder(alias);
    }

    public delete(entities: number | T | T[]): Promise<boolean> {
        let deletePromise: Promise<DeleteResult | T | T[]> = null;

        if (typeof (entities) === "number") {
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
            queryBuilder, queryBuilder.getMany
        );
        return query;
    }

    public getById(id: number): IQuery<T, T> {
        const alias: string = "entity";
        let queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder(alias);
        queryBuilder = queryBuilder.where(`${alias}.id = :id`, { id: id });
        const query: IQuery<T, T> = new Query(
            queryBuilder, queryBuilder.getOne
        );
        return query;
    }

    public getOne(): IQuery<T, T> {
        const queryBuilder: SelectQueryBuilder<T> = this.createQueryBuilder("entity");
        const query: IQuery<T, T> = new Query(
            queryBuilder, queryBuilder.getOne
        );
        return query;
    }

    public update<E extends T | T[]>(entities: E): Promise<E> {
        return <Promise<E>>this._repository.save(<any>entities);
    }
}