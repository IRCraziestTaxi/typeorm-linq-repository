// Support *-to-one, one-to-many, and lazy loaded relations.
export declare type JoinedEntityType<J> = J | J[] | Promise<J[]> | Promise<J>;
