/**
 * Options for setting up the repository.
 */
export interface RepositoryOptions {
    /**
     * True if the entity implements a property named "id" that is auto-generated; defaults to true.
     */
    autoGenerateId?: boolean;
    /**
     * The name of the database connection to use to create the repository.
     */
    connectionName?: string;
}
