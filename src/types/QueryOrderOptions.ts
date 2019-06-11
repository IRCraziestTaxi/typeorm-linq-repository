/**
 * Options for query ordering such as where to put nulls (supported by some databases).
 */
export interface QueryOrderOptions {
    /**
     * Whether to put null values first when ordering query results.
     */
    nullsFirst?: boolean;
}