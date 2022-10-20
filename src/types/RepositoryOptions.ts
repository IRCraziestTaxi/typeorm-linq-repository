import { EntityBase } from "./EntityBase";

/**
 * Options for setting up the repository.
 */
export interface RepositoryOptions<T extends EntityBase> {
    /**
     * True if the entity contains a primary key that is auto-generated; defaults to true.
     * If the auto-generated primary key is NOT "id", then also set "primaryKeyName".
     */
    autoGenerateId?: boolean;
    /**
     * The entity's primary key property in lambda form (e.g. "e => e.entityId");
     * if omitted, the default primary key property name is "id".
     */
    primaryKey?(entity: T): string | number;
}
