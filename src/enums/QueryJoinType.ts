export enum QueryJoinType {
    /**
     * Only performing an inner join without including the relation.
     */
    InnerJoin = 0,
    /**
     * Performing a left join and including the relation in the results.
     */
    Include = 1
}