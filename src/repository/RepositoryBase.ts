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

    public create<E = T | T[]>(entities: E): Promise<E> {
        if (entities instanceof Array) {
            // TODO: Can this be done correctly? Don't care right now. Typescript is pissing me off.
            for (let entity of (<T[]><any>entities)) {
                entity.id = undefined;
            }
        }
        else {
            // TODO: Can this be done correctly? Don't care right now. Typescript is pissing me off.
            (<T><any>entities).id = undefined;
        }

        return this.update(entities);
    }

    public createQueryBuilder(alias: string): SelectQueryBuilder<T> {
        return this._repository.createQueryBuilder(alias);
    }

    public delete<E = T | T[]>(entities: E): Promise<boolean> {
        return this._repository.delete(entities).then(() => {
            return Promise.resolve(true);
        }).catch((error: any) => {
            return Promise.reject(new Error(error));
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

    public update<E = T | T[]>(entities: E): Promise<E> {
        return this._repository.save(entities);
    }
}