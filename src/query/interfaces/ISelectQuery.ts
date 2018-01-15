/**
 * Used to select the desired propery from the desired entity when using an inner query.
 * No further methods may be used after selecting a property because this interface is meant to serve just that purpose.
 */
export interface ISelectQuery<T extends { id: number }, R extends T | T[], P = T> {
}