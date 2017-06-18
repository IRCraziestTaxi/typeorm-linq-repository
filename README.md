# typeorm-linq-repository
Wraps TypeORM repository pattern and QueryBuilder using fluent, LINQ-style queries.

## Foreword

This is a work in progress. I am still learning all the intricacies of TypeORM's QueryBuilder, so complex queries may not work as expected. It handles simple `include`s, `thenInclude`s, `where`s, and `orderBy`s very well and now handles filtering included relationships, but there has not yet been any testing on complicated queries. An NPM package will come soon after a little more testing has been performed. If you do want to clone and use the code, I only ask that you please submit issues and/or pull requests so that any problems can be straightened out.

### Prerequisites

A few things to note regarding this project:

1. TypeORM, a code-first relational database ORM for typescript, is the foundation of this project. If you are unfamiliar with TypeORM, I strongly suggest that you check it out.

2. This project also relies on ts-simple-nameof, another repository by IRCraziestTaxi. Again, an NPM package for that is coming soon, but in the meantime, you can get the code from the repository and use it wherever you'd like.

3. This project is meant to be used in typescript. The main point of this framework is to gain type safety for queries, which requires the use of typescript. If there is enough demand, a build compatible with javascript will be published, but in the meantime, it is offered as-is.

## Base Repository
The BaseRepository takes a class type representing a TypeORM model as its constructor argument.

For example:

`IUserRepository.ts`
```typescript
import { IRepositoryBase } from "typeorm-linq-repository";
import { IUser } from "../../entities/interfaces/IUser";

export interface IUserRepository extends IRepositoryBase<IUser> {
}
```

`UserRepository.ts`
```typescript
import { RepositoryBase } from "typeorm-linq-repository";
import { IUser } from "../entities/interfaces/IUser";
import { User } from "../entities/User";

export class UserRepository extends RepositoryBase<IUser> implements IUserRepository {
    constructor() {
        super(User);
    }
}
```

### Injecting BaseRepository
Protip: You can easily make RepositoryBase injectable! For example, using InversifyJS:

```typescript
import { decorate, injectable, unmanaged } from "inversify";
import { RepositoryBase } from "typeorm-linq-repository";

decorate(injectable(), RepositoryBase);
decorate(unmanaged(), RepositoryBase, 0);

export { RepositoryBase };
```

## Using Queries
typeorm-linq-repository not only makes setting up repositories incredibly easy; it also gives you powerful, LINQ-style query syntax.

### Retrieving Entities
You can query entities for all, many, or one result:

```typescript
this._userRepository.getAll(); // Gets all entities.
this._userRepository.getAll().where(/*...*/); // Gets many entities.
this._userRepository.getOne().where(/*...*/); // Gets one entity.
this._userRepository.getById(id); // Finds one entity using its ID.
```

### Type Safe Querying
This LINQ-style querying really shines by giving you type-safe includes and where statements, eliminating the need for hard-coded property names in query functions.

This includes conditional statements:

```typescript
this._userRepository.getOne().where(u => u.email).equal(email);
```

As well as include statements:

```typescript
this._userRepository.getById(id).include(u => u.posts);
```

If the property "posts" ever changes, you get compile-time errors, ensuring the change is not overlooked in query statements.

### Multiple Includes

You can use `include()` more than once to include several properties on the query's base type:

```typescript
this._userRepository.getById(id).include(u => u.posts).include(u => u.orders);
```

### Subsequent Includes and Current Property Type
Include statements transform the "current property type" on the Query so that where statements and subsequent `thenInclude()`s can be executed while maintaining this type safety.

```typescript
this._userRepository.getById(id).include(u => u.posts).thenInclude(p => p.comments);
```

```typescript
this._userRepository.getById(id).include(u => u.orders).thenInclude(o => o.items).thenInclude(i => i.UPC);
```

### Base Type
Using `.include()` after one or more `.thenInclude()`s will also return the query to its base type:

```typescript
this._userRepository.getById(id).include(u => u.posts).thenInclude(p => p.comments).include(u => u.orders).thenInclude(o => o.items);
```

Using `.where()`, `.and()`, or `.or()` will do the same thing:

```typescript
this._userRepository.getAll().include(u => u.posts).thenInclude(p => p.comments).where(u => u.email).equal(email);
```

### Filtering Included Relationships

`.where()`, `.and()`, and `.or()` do not work on included properties; to filter included relationships, use `.includeWhere()` and `.thenIncludeWhere()`.

```typescript
this._userRepository.includeWhere(u => u.posts, p => p.date).lessThan(date).thenIncludeWhere(p => p.comments, c => c.date).greaterThan(otherDate);
```

### Ordering Queries
You can order queries in any direction you want and using as many subsequent order statements as needed.

```typescript
this._userRepository.getAll().orderBy(u => u.lastName).thenBy(u => u.firstName);
```

You can use include statements to change the query's property type and order on properties of that child.

```typescript
this._userRepository.getAll().orderByDescending(u => u.email).include(u => u.posts).thenByDescending(p => p.date);
```

### Using Query Results
Queries are transformed into promises whenever you are ready to consume the results.

Queries can be returned as raw promises:

```typescript
this._userRepository.getById(id).toPromise();
```

Or invoked as a promise on the spot:

```typescript
this._userRepository.getById(id).then((user: IUser) => { /* ... */ });
```