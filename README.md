# typeorm-linq-repository
Wraps TypeORM repository pattern and QueryBuilder using fluent, LINQ-style queries.

##Base Repository
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

###Injecting BaseRepository
Protip: You can easily make RepositoryBase injectable! For example, using InversifyJS:

```typescript
import { decorate, injectable, unmanaged } from "inversify";
import { RepositoryBase } from "typeorm-linq-repository";

decorate(injectable(), RepositoryBase);
decorate(unmanaged(), RepositoryBase, 0);

export { RepositoryBase };
```

##Using Queries
typeorm-linq-repository not only makes setting up repositories incredibly easy; it also gives you powerful, LINQ-style query syntax.

###Retrieving Entities
You can query entities for all, many, or one result:

```typescript
this._userRepository.getAll(); // Gets all entities.
this._userRepository.getAll().where(/*...*/); // Gets many entities.
this._userRepository.getOne().where(/*...*/); // Gets one entity.
this._userRepository.getById(id); // Finds one entity using its ID.
```

###Type Safe Querying
This LINQ-style querying really shines by giving you type-safe includes and where statements, eliminating the need for hard-coded property names in query functions.

This includes conditional statements:

```typescript
this._userRepository.getOne().where(u => u.email).equal(email);
```

As well as include statements:

```typescript
this._userRepository.getUserById(id).include(u => u.posts);
```

If the property "posts" ever changes, you get compile-time errors, ensuring the change is not overlooked in query statements.

###Current Property Type
Include statements transform the "current property type" on the Query so that where statements and subsequent includes can be executed while maintaining this type safety.

```typescript
this._userRepository.getUserById(id).include(u => u.posts).thenInclude(p => p.comments);
```

```typescript
this._userRepository.getUserById(id).include(u => u.orders).thenInclude(o => o.items).thenInclude(i => i.UPC);
```

You can use conditional statements on the current property type at any point during the include chain:

```typescript
this._userRepository.getUserById(id).include(u => u.posts).where(p => p.date).lessThan(date).thenInclude(p => p.comments).where(c => c.date).greaterThan(otherDate);
```

###Base Type
You can return to the Query's base type after a sequence of include statements.

```typescript
this._userRepository.getUserById(id).include(u => u.posts).thenInclude(p => p.comments).usingBaseType().where(u => u.active).isTrue();
```

Using `.include()` after one or more `.thenInclude()`s will also return the query to its base type:

```typescript
this._userRepository.getUserById(id).include(u => u.posts).thenInclude(p => p.comments).include(u => u.orders).thenInclude(o => o.items);
```

###Ordering Queries
You can order queries in any direction you want and using as many subsequent order statements as needed.

```typescript
this._userRepository.getAll().orderBy(u => u.email).thenBy(u => u.username);
```

You can use include statements to change the query's property type and order on properties of that child.

```typescript
this._userRepository.getAll().orderByDescending(u => u.email).include(u => u.posts).thenByDescending(p => p.date);
```

###Using Query Results
Queries are transformed into promises whenever you are ready to consume the results.

Queries can be returned as raw promises:

```typescript
this._userRepository.getUserById(id).toPromise();
```

Or invoked as a promise on the spot:

```typescript
this._userRepository.getUserById(id).then((user: IUser) => { /* ... */ });
```