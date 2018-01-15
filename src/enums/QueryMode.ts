export enum QueryMode {
    /**
     * The default mode of a query in which results are returned.
     */
    Get = 0,
    /**
     * The mode of a query in which a relation is joined or included.
     */
    Join = 1,
    /**
     * The mode of a query in which a comparison is being made.
     */
    Compare = 2
}