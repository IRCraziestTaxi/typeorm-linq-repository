export enum QueryWhereType {
    /**
     * A normal comparison (not on a joined entity).
     */
    Normal = 0,
    /**
     * A comparison involving a joined entity.
     */
    Joined = 1
}