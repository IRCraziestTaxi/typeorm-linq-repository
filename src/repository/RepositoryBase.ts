import { getConnectionManager, Repository, SelectQueryBuilder } from "typeorm";
import { IRepositoryBase } from "./interfaces/IRepositoryBase";
import { IQuery } from "../query/interfaces/IQuery";
import { Query } from "../query/Query";

/**
 * Base repository operations for TypeORM entities.
 */
export abstract class RepositoryBase<T extends { id: number }> implements IRepositoryBase<T> {
    protected readonly _repository: Repository<T>;

    public constructor(entityType: { new(...params: any[]): T; }) {
        this._repository = getConnectionManager().get().getRepository<T>(entityType);
    }

    public create<E extends T | T[]>(entities: E): Promise<E> {
        if (entities instanceof Array) {
            for (let entity of (<T[]>entities)) {
                entity.id = undefined;
            }
        }
        else {
            (<T>entities).id = undefined;
        }

        return this.update(entities);
    }

    public createQueryBuilder(alias: string): SelectQueryBuilder<T> {
        return this._repository.createQueryBuilder(alias);
    }

    public delete(entities: number | T | T[]): Promise<boolean> {
        let deletePromise: Promise<void | T | T[]> = null;

        if (typeof (entities) === "number") {
            deletePromise = this._repository.deleteById(entities);
        }
        // Compiler nonsense.
        else if (entities instanceof Array) {
            deletePromise = this._repository.remove(entities);
        }
        else {
            deletePromise = this._repository.remove(entities);
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
        // Compiler nonsense.
        if (entities instanceof Array) {
            return <Promise<E>>this._repository.save(entities);
        }
        else {
            return <Promise<E>>this._repository.save(<T>entities);
        }
    }
}