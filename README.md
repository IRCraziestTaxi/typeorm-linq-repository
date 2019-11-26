# typeorm-linq-repository
Wraps TypeORM repository pattern and QueryBuilder using fluent, LINQ-style queries.

## What's New
typeorm-linq-repository is now out of alpha! Huge thanks to everybody who used this library and helped make it what it is today!

### Latest Changes
As of version 1.1.0:

A fix was implemented in which entities not implementing a property named `id` were not compatible with `LinqRepository`. To mitigate this, `id` was removed from the base `EntityBase` type. In addition:

* `RepositoryOptions` now allows you to specify the name of the entity's primary key in case it is not `id` so that `create` may still be used with the option `autoGenerateId` enabled and `getById` may be used. To do so:

```ts
new LinqRepository(Entity, {
    primaryKey: e => e.entityId
});
```

As of version 1.0.1:

A fix/improvement was implemented in which `include`d or `thenInclude`d relations may now be filtered by later using `join` or `thenJoin` along with a `where`. See the Filtering Included Relations section below.

As of version 1.0.0:

* The `update` method is now an alias for the new `upsert` method. This change was made to clarify that typeorm-linq-repository calls TypeORM's `save` method, which performs upserts on the provided entities. The `update` method was left in place to avoid breaking changes.

* The `ts-simple-nameof` dependency was updated to strip assertion operators from parsed property names in order to allow the following:

```ts
await fooRepository
    .getAll()
    .where(foo => foo.bar!.baz)
    .equal(value);
```

which is sometimes necessary when using strict null checks, for instance when a relationship is typed as optional/nullable.

* `LinqRepository` now exposes a `typeormRepository` property, which allows you to use the underlying TypeORM Repository if you need to access methods not available via the `createQueryBuilder` method. The `createQueryBuilder` method, although now redundant, was left in place to avoid breaking changes.

In version 1.0.0-alpha.23, a bug was fixed in which a call to the `where` method on a non-joined query with multiple joins in the property selector (i.e. `.where(p => p.comments.map(c => c.user.email))`) would use the wrong alias and throw an error.

As of version 1.0.0-alpha.22:

* Checking for existence or absence of relations in an array of relations (or existence or absense of relations that meet a certain condition) is now supported!

For example:

```ts
const accessiblePosts = await postRepository
    // Get posts where...
    .getAll()
    // Note: Must use groupBy method to check relations.
    .groupBy(p => p.id)
    // ...no tags exist...
    .whereNone(p => p.tags, t => t.id)
    // ...or the post contains the tag being searched for.
    .orAny(p => p.tags, t => t.id, t => t.id)
    .equal(tagId);
```

Notice the second argument in the `whereNone` and `orAny` methods. This argument simply serves as an arbitrary primitive property to `COUNT` relationships in the `HAVING` statement(s) resulting from those methods. This was done in order to not restrict entities to have a primary key named `id`; although that restriction would have conveniently shortened the signature of the method, not all schemas may name primary keys `id`.

See the Checking Relations section below.

* A bug was fixed in usage of the `where` method following the `include` or `thenInclude` methods. Previously, although the interface claimed that a `where` method following an `include` method operated on the query's base type, the query actually continued using the last included property type.

## Foreword
This is a work in progress. This project is currently in alpha and should be treated as such. That being said, it is finally receiving a massive update after six months of inactivity, so I hope it will continue to see lots of use and continue to mature.

`typeorm-linq-repository`'s queries handle simple includes, joins, and join conditions very well and now has the capability to take on more complex queries. The only way it will continue to mature is to have its limits tested see some issues and pull requests come in.

`typeorm-linq-repository` has been tested with Postgres and MySQL, but since TypeORM manages the ubiquity of queries amongst different database engines, it should work just fine with all database engines. Please feel free to give it a try and provide as much testing as possible for it!

## Prerequisites
[TypeORM](https://github.com/typeorm/typeorm "TypeORM"), a code-first relational database ORM for typescript, is the foundation of this project. If you are unfamiliar with TypeORM, I strongly suggest that you check it out.

## Installation
To add `typeorm-linq-repository` and its dependencies to your project using NPM:

```
npm install --save typeorm typeorm-linq-repository
```

## Linq Repository
`LinqRepository` is the repository that is constructed to interact with the table represented by the entity used as the type argument for the repository.

`LinqRepository` takes a class type representing a TypeORM model as its constructor argument.

```ts
import { LinqRepository } from "typeorm-linq-repository";
import { User } from "../../entities/User";

const userRepository: LinqRepository<User> = new LinqRepository(User);
```

## Base Repository
`RepositoryBase` is now an alias for the renamed `LinqRepository` for backwards compability. Previously, you had to extend a repository class from the abstract `RepositoryBase` in order to construct your repository.

For example:

`IUserRepository.ts`
```ts
import { IRepositoryBase } from "typeorm-linq-repository";
import { User } from "../../entities/User";

export interface IUserRepository extends IRepositoryBase<User> {
}
```

`UserRepository.ts`
```ts
import { RepositoryBase } from "typeorm-linq-repository";
import { User } from "../entities/User";
import { IUserRepository } from "./interfaces/IUserRepository";

export class UserRepository extends RepositoryBase<User> implements IUserRepository {
    public constructor() {
        super(User);
    }
}
```

### Repository Options
To modify default behavior when setting up a repository, use `RepositoryOptions`.

Repository options include:

`autoGenerateId`: A boolean value indicating whether the entity implements a primary key that is auto-generated. Default is `true`.
`connectionName`: The name of the TypeORM database connection to use to create the repository.
`primaryKey`: A lambda function providing the entity's primary key property if it is not named `id`.

```ts
new LinqRepository(Entity, {
    // This entity has a primary key that is not auto-generated.
    autoGenerateId: false,
    // Get the repository from a specific connection rather than the default connection.
    connectionName: "connection-name",
    // This entity has a primary key whose name is not "id".
    primaryKey: e => e.entityId
});
```

Or as a repository extending `LinqRepository` (now aliased by the previously abstract `RepositoryBase`):

```ts
import { RepositoryBase } from "typeorm-linq-repository";
import { Entity } from "../entities/Entity";
import { IEntityRepository } from "./interfaces/IEntityRepository";

export class EntityRepository extends RepositoryBase<Entity> implements IEntityRepository {
    public constructor() {
        super(Entity, {
            // This entity has a primary key that is not auto-generated.
            autoGenerateId: false,
            // Get the repository from a specific connection rather than the default connection.
            connectionName: "connection-name",
            // This entity has a primary key whose name is not "id".
            primaryKey: e => e.entityId
        });
    }
}
```

### Injecting RepositoryBase
Protip: You can easily make `RepositoryBase` injectable! For example, using InversifyJS:

```ts
import { decorate, injectable, unmanaged } from "inversify";
import { RepositoryBase } from "typeorm-linq-repository";

decorate(injectable(), RepositoryBase);
decorate(unmanaged(), RepositoryBase, 0);
decorate(unmanaged(), RepositoryBase, 1);

export { RepositoryBase };
```

## Using Queries
`typeorm-linq-repository` not only makes setting up repositories incredibly easy; it also gives you powerful, LINQ-style query syntax.

### Retrieving Entities
You can query entities for all, many, or one result:

```ts
 // Gets all entities.
this._userRepository.getAll();

// Gets many entities.
this._userRepository
    .getAll()
    .where(u => u.admin)
    .isTrue();

// Gets one entity.
this._userRepository
    .getOne()
    .where(u => u.email)
    .equal(email);

// Finds one entity using its ID.
this._userRepository.getById(id);
```

### Counting Results
You may call `count()` on a query to get the count of records matching the current query conditions without killing the query as awaiting or calling `.then()` on the query otherwise would; this way, you can use a query to count all records matching a set of conditions and then set paging parameters on the same query.

For example:

```ts
let activeUserQuery = this._userRepository
    .getAll()
    .where(u => u.active)
    .isTrue();

// Count all active users.
const activeUserCount = await activeUserQuery.count();

// Set paging parameters on the query.
activeUserQuery = activeUserQuery
    .skip(skip)
    .take(take);

const pagedActiveUsers = await activeUserQuery;
```

### Type Safe Querying
This LINQ-style querying really shines by giving you type-safe includes, joins, and where statements, eliminating the need for hard-coded property names in query functions.

This includes conditional statements:

```ts
this._userRepository
    .getOne()
    .where(u => u.email)
    .equal(email);
```

As well as include statements:

```ts
this._userRepository
    .getById(id)
    .include(u => u.posts);
```

If the property `posts` ever changes, you get compile-time errors, ensuring the change is not overlooked in query statements.

### Multiple Includes
You can use `include()` more than once to include several properties on the query's base type:

```ts
this._userRepository
    .getById(id)
    .include(u => u.posts)
    .include(u => u.orders);
```

### Subsequent Includes and Current Property Type
Include statements transform the "current property type" on the Query so that subsequent `thenInclude()`s can be executed while maintaining this type safety.

```ts
this._userRepository
    .getById(id)
    .include(u => u.orders)
    .thenInclude(o => o.items);
```

```ts
this._userRepository
    .getById(id)
    .include(u => u.posts)
    .thenInclude(p => p.comments)
    .thenInclude(c => c.user);
```

You can use `include()` or `thenInclude()` on the same property more than once to subsequently include another relation without duplicating the include in the executed query.

```ts
this._userRepository
    .getById(id)
    .include(u => u.posts)
    .thenInclude(p => p.comments)
    .include(u => u.posts)
    .thenInclude(p => p.subscribedUsers);
```

### Filtering Results
Queries can be filtered on one or more conditions using `where()`, `and()`, and `or()`. Note that, just as with TypeORM's QueryBuilder, using `where()` more than once will overwrite previous `where()`s, so use `and()` and `or()` to add more conditions.

```ts
this._userRepository
    .getAll()
    .where(u => u.isActive)
    .isTrue()
    .and(u => u.lastLogin)
    .greaterThan(date);
```

Note also that this caveat only applies to "normal" where conditions; a where condition on a join is local to that join and does not affect any "normal" where conditions on a query.

```ts
this._postRepository
    .getAll()
    .join((p: Post) => p.user)
    .where((u: User) => u.id)
    .equal(id)
    .where((p: Post) => p.archived)
    .isTrue();
```

### Filtering Included Relations
To filter `include`d or `thenInclude`d relationships (which is not possible by using `.include(...).where(...)` since using `where` after `include` resets the query rather than performing a `where` on the `include`), use `join` or `thenJoin` after the `include` or `thenInclude`.

```ts
this._postRepository
    .getAll()
    .include(p => p.comments)
    // We want to exclude included comments based on conditions on replies
    // while not filtering any posts.
    .thenInclude(c => c.replies)
    // Therefore, use a joinAlso() here to maintain a LEFT JOIN on comments
    .joinAlso(p => p.comments)
    // but use a thenJoin() here to restrict comments and replies
    // to an INNER JOIN based on conditions.
    .thenJoin(c => c.replies)
    .where(r => r.user.email)
    .equal(filterEmail);
```

### Joined Properties in Comparisons
It is possible to join relationships on the fly during a conditional clause in order to compare a relationship's value.

```ts
this._postRepository
    .getAll()
    .where(p => p.date)
    .greaterThan(date)
    .and(p => p.user.id)
    .equal(userId);
```

In order to join through collections in this fashion, use the `Array.map()` method.

```ts
this._userRepository
    .getAll()
    .where(u => u.posts.map(p => p.comments.map(c => c.flagged)))
    .isTrue();
```

Note: If not already joined via one of the available `join` or `include` methods, relationships joined in this fashion will be joined as follows:

* `where()` and `and()` result in an `INNER JOIN`.
* `or()` results in a `LEFT JOIN`.

### Grouped (Bracketed) Conditional Clauses
In order to group conditional clauses into parentheses, use `isolatedWhere()`, `isolatedAnd()`, and `isolatedOr()`.

```ts
this._userRepository
    .getOne()
    .where(u => u.isAdmin)
    .isTrue()
    .isolatedOr(q => q
        .where(u => u.firstName)
        .equals("John")
        .and(u => u.lastName)
        .equals("Doe")
    ).isolatedOr(q => q
        .where(u => u.firstName)
        .equals("Jane")
        .and(u => u.lastName)
        .equals("Doe")
    );
```

### Comparing Basic Values
The following query conditions are available for basic comparisons:

`beginsWith(value: string)`: Finds results where the queried text begins with the supplied string.

`contains(value: string)`: Finds results were the queried text contains the supplied string.

`endsWith(value: string)`: Finds results where the queried text ends with the supplied string.

`equal(value: string | number | boolean)`: Finds results where the queried value is equal to the supplied value.

`greaterThan(value: number)`: Finds results where the queried value is greater than the supplied number.

`greaterThanOrEqual(value: number)`: Finds results where the queried value is greater than or equal to the supplied number.

`in(include: string[] | number[])`: Finds results where the queried value intersects the specified array of values to include.

`isFalse()`: Finds results where the queried boolean value is false.

`isNotNull()`: Finds results where the queried relation is not null.

`isNull()`: Finds results where the queried relation is null.

`isTrue()`: Finds results where the queried boolean value is true.

`lessThan(value: number)`: Finds results where the queried value is less than the supplied number.

`lessThanOrEqual(value: number)`: Finds results where the queried value is less than or equal to the supplied number.

`notEqual(value: string | number | boolean)`: Finds results where the queried value is not equal to the supplied value.

`notIn(exclude: string[] | number[])`: Finds results where the queried value intersects the specified array of values to exclude.

`inSelected()` and `notInSelected()` are also available and are covered later in this guide.

### String Comparison
When comparing strings, the default behavior is to not match case (case-insensitive comparison).

If a case-sensitive comparison is desired, use the `matchCase` option when executing a comparison.

```ts
// Perform a case-sensitive comparison rather than the default case-insensitive.
equal(value, { matchCase: true });
```

Note that, due to a lack of type reflection in JavaScript, the opposite is true for comparing values with joined entities. See the Comparing Values With Joined Entities section below.

### Inner Joins
Filter joined relations by using `where()`, `and()`, and `or()` on inner joins using `join()` and `thenJoin()`.

```ts
this._userRepository
    .getAll()
    .join(u => u.posts)
    .where(p => p.archived)
    .isTrue();

this._userRepository
    .getOne()
    .join(u => u.posts)
    .where(p => p.flagged)
    .isTrue()
    .and(p => p.date)
    .greaterThan(date);
```

Just as with `include()` and `thenInclude()`, `join()` always uses the query's base type, while `thenJoin()` continues to use the last joined entity's type.

```ts
this._postRepository
    .getAll()
    .join(p => p.user)
    .where(u => u.id)
    .equal(id)
    .thenJoin(u => u.comments)
    .where(c => c.flagged)
    .isTrue()
    .join(p => p.comments)
    .thenJoin(c => c.user)
    .where(u => u.dateOfBirth)
    .lessThan(date);
```

### Left Joins
As the above `join()` and `thenJoin()` perform an `INNER JOIN`, desired results may be lost if you wish to not exclude previously included results if the joined relations fail the join condition. Filter joined relations while not excluding previously included results by using `joinAlso()` and `thenJoinAlso()` to perform a `LEFT JOIN` instead.

### Regarding Included Relationships
Note that `.include()` and `.thenInclude()` are not intended to work the same way as `.join()`, `.joinAlso()`, `.thenJoin()`, and `.thenJoinAlso()` in conjunction with `.where()`.

That is, using `.include().where()` does NOT behave the same way as `.join().where()` (interpreted in "plain English" as "join where").

`.include()` and `.thenInclude()` were meant to stand alone in their own context rather than filtering the main entity based on joined relationships.

For example:

```ts
this._userRepository
    .getMany()
    // I want to include posts in my results, but I am filtering included posts without filtering user results.
    .include(u => u.posts)
    // However, I am also filtering on the user itself (.where() after .include() filters on the base type).
    .where(u => u.active)
    .isTrue();
```

On the other hand, if you do intend to include a relationship while also filtering results based on a condition on that included relationship, use `.include()` in conjunction with `.join().where()`, i.e.:

```ts
this._userRepository
    .getMany()
    // Include posts in results.
    .include(u => u.posts)
    // Use .join rather than .joinAlso to actually filter user results by post criteria.
    .join(u => u.posts)
    .where(p => p.archived)
    .isTrue();
```

Finally, if you intend to include a relationship while filtering those included relationships but not filtering out any entities of the base type, then use `.joinAlso().where()` in order to perform a `LEFT JOIN` as opposed to an `INNER JOIN`.

```ts
this._userRepository
    .getMany()
    // Include posts in results.
    .include(u => u.posts)
    // Use .joinAlso rather than .join to perform a left join to filter posts but not filter users.
    .joinAlso(u => u.posts)
    .where(p => p.archived)
    .isTrue();
```

### Joining Foreign Entities
Join from an unrelated entity using `from()`. A simple example of this is not easily provided, so see examples below for further guidance on using this method.

```ts
this._songRepository
    .getAll()
    .join(s => s.artist)
    .where(a => a.id)
    .equal(artistId)
    .from(UserProfileAttribute)
    .thenJoin(p => p.genre)
    // ...
```

### Comparing Values With Joined Entities
Perform comparisons with values on joined entities by calling `from()`, `join()`, and `thenJoin()` after calling `where()`, `and()`, or `or()`.

```ts
this._userRepository
    .getAll()
    .join(u => u.posts)
    .where(p => p.recordLikeCount)
    .thenJoin(p => p.category)
    .greaterThanJoined(c => c.averageLikeCount);
```

The following query conditions are available for comparisons on related entities' properties:

`equalJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is equal to the specified property on the last joined entity.

`greaterThanJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is less than the specified property on the last joined entity.

`greaterThanOrEqualJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is greater than or equal to the specified property on the last joined entity.

`lessThanJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is less than the specified property on the last joined entity.

`lessThanOrEqualJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is less than or equal to the specified property on the last joined entity.

`notEqualJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is not equal to the specified property on the last joined entity.

### String Comparison When Comparing Values With Joined Entities
Note that although non-joined string comparisons defaults to case-insensitive comparison, due to a lack of type reflection in JavaScript, the opposite is true for comparing values with joined entities. Therefore, the default behavior when using the above methods is to perform a case sensitive comparison, so you must specify `matchCase: false` when using the above methods if you wish to perform a case-insensitive comparison.

```ts
// Perform a case-insensitive comparison rather than the default case-sensitive when comparing joined entity's properties.
equalJoined(x => x.property, { matchCase: false });
```

### Checking Relations
It is possible to check for existence or absence of relations in an array of relations (or existence or absense of relations that meet a certain condition).

For example:

```ts
const accessiblePosts = await postRepository
    // Get posts where...
    .getAll()
    // Note: Must use groupBy method to check relations.
    .groupBy(p => p.id)
    // ...no tags exist (meaning the post is not restricted to a certain tag)...
    .whereNone(p => p.tags, t => t.id)
    // ...or the post contains the tag being searched for.
    .orAny(p => p.tags, t => t.id, t => t.id)
    .equal(tagId);
```

NOTE: As the underlying query executes methods that check relations as `HAVING COUNT(...)`, you MUST use the `groupBy` method to group results on an arbitrary primitive property of the query's base type; for instance, the primary key.

The following relation checking methods are available:

`whereAny`: Checks for existence of the specified relations; optionally checks for existence of relations meeting a criteria determined by the optional `conditionPropSelector` argument in conjunction with the following comparing method.

`whereNone`: Checks for absence of the specified relations; optionally checks for absence of relations meeting a criteria determined by the optional `conditionPropSelector` argument in conjunction with the following comparing method.

`andAny`: The same as `whereAny` but performed as `AND COUNT(...) > 0` (supplementing the initial `HAVING COUNT(...)`).

`andNone`: The same as `whereNone` but performed as `AND COUNT(...) = 0` (supplementing the initial `HAVING COUNT(...)`).

`orAny`: The same as `whereAny` but performed as `OR COUNT(...) > 0` (supplementing the initial `HAVING COUNT(...)`).

`orNone`: The same as `whereNone` but performed as `OR COUNT(...) = 0` (supplementing the initial `HAVING COUNT(...)`).

### Including or Excluding Results Within an Inner Query
To utilize an inner query, use the `inSelected()` and `notInSelected()` methods. Each takes an inner `ISelectQuery`, which is obtained by calling `select()` on the inner query after its construction and simply specifies which value to select from the inner query to project to the `IN` or `NOT IN` list.

The following example is overkill since, in reality, you would simply add the condition that the post is not archived on the main query, but consider what is going on within the queries in order to visualize how inner queries in `typeorm-linq-repository` work.

Consider a `PostRepository` from which we want to get all posts belonging to a certain user and only those that are not archived. The outer query in this instance gets all posts belonging to the specified user, while the inner query specified all posts that are not archived. The union of the two produces the results we want.

```ts
this._postRepository
    .getAll()
    .join(p => p.user)
    .where(u => u.id)
    .equal(id)
    .where(p => p.id)
    .inSelected(
        this._postRepository
            .getAll()
            .where(p => p.archived)
            .isFalse()
            .select(p => p.id)
    );
```

This next example is more representative of an actual situation in which an inner query is useful. Consider an application in which users set up a profile and add Profile Attributes which specify genres of songs they do NOT wish to hear; that is, the application would avoid songs with genres specified by the user's profile.

Given the following models:

`Artist.ts`
```ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Song } from "./Song";

@Entity()
export class Artist {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @OneToMany(() => Song, (song: Song) => song.artist)
    public songs: Song[];
}
```

`Genre.ts`
```ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { SongGenre } from "./SongGenre";

@Entity()
export class Genre {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @OneToMany(() => SongGenre, (songGenre: SongGenre) => songGenre.genre)
    public songs: SongGenre[];
}
```

`Song.ts`
```ts
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Artist } from "./Artist";
import { SongGenre } from "./SongGenre";

@Entity()
export class Song {
    @ManyToOne(() => Artist, (artist: Artist) => artist.songs)
    public artist: Artist;

    @OneToMany(() => SongGenre, (songGenre: SongGenre) => songGenre.song)
    public genres: SongGenre[];

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;
}
```

`SongGenre.ts`
```ts
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Genre } from "./Genre";
import { Song } from "./Song";

/**
 * Links a song to a genre.
 */
@Entity()
export class SongGenre {
    @ManyToOne(() => Genre, (genre: Genre) => genre.songs)
    public genre: Genre;

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => Song, (song: Song) => song.genres)
    public song: Song;
}
```

`User.ts`
```ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { UserProfileAttribute } from "./UserProfileAttribute";

@Entity()
export class User {
    @Column({ nullable: false })
    public email: string;

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public password: string;

    @OneToMany(() => UserProfileAttribute, (profileAttribute: UserProfileAttribute) => profileAttribute.user)
    public profile: UserProfileAttribute[];
}
```

`UserProfileAttribute.ts`
```ts
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Genre } from "./Genre";
import { User } from "./User";

/**
 * An attribute of a user's profile specifying a genre that user does not wish to hear.
 */
@Entity()
export class UserProfileAttribute {
    @ManyToOne(() => Genre)
    public genre: Genre;

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne(() => User, (user: User) => user.profile)
    public user: User;
}
```

Now, consider the following query from which we want to gather all songs by a certain artist that a certain user wants to hear; that is, songs by that artist that do not match a genre blocked by the user's profile.

```ts
this._songRepository
    .getAll()
    .join(s => s.artist)
    .where(a => a.id)
    .equal(artistId)
    .where(s => s.id)
    .notInSelected(
        this._songRepository
            .getAll()
            .join(s => s.artist)
            .where(a => a.id)
            .equal(artistId)
            .from(UserProfileAttribute)
            .thenJoin(p => p.genre)
            .where(g => g.id)
            .join(s => s.songGenre)
            .thenJoin(sg => sg.genre)
            .equalJoined(g => g.id)
            .from(UserProfileAttribute)
            .thenJoin(p => p.user)
            .where(u => u.id)
            .equal(userId)
            .select(s => s.id)
    );
```

### Selection Type
Calling `select()` after completing any comparison operations uses the query's base type. If you wish to select a property from a relation rather than the query's base type, you may call `select()` after one or more joins on the query.

```ts
this._songRepository
    .getAll()
    .join(s => s.genres)
    .thenJoin(sg => sg.genre)
    .select(g => g.id);
```

### Ordering Queries
You can order queries in either direction and using as many subsequent order statements as needed.

```ts
this._userRepository
    .getAll()
    .orderBy(u => u.lastName)
    .thenBy(u => u.firstName);
```

You can use include statements to change the query's property type and order on properties of that child.

```ts
this._userRepository
    .getAll()
    .orderByDescending(u => u.email)
    .include(u => u.posts)
    .thenByDescending(p => p.date);
```

### Grouping Results
You can group results by one or more properties using `groupBy` and `thenGroupBy`.

```ts
this._userRepository
    .getAll()
    .groupBy(u => u.lastName)
    .thenGroupBy(u => u.firstName);
```

### Using Query Results
Queries are transformed into promises whenever you are ready to consume the results.

Queries can be returned as raw promises:

```ts
this._userRepository
    .getById(id)
    .toPromise();
```

Or invoked as a promise on the spot:

```ts
this._userRepository
    .getById(id)
    .then(user => {
        // ...
    });
```

Or, using ES6 async syntax:

```ts
const user = await this._userRepository.getById(user);
```

### Using TypeORM's Query Builder
If you encounter an issue or a query which this query wrapper cannot accommodate, you can use TypeORM's native QueryBuilder.

```ts
this._userRepository.createQueryBuilder("user");
```

## Persisting Entities
The following methods persist and remove entities from the database:

```ts
// Creates one or more entities.
create(entities: T | T[]): Promise<T | T[]>;

// Deletes one or more entities by reference or one entity by ID.
delete(entities: number | string | T | T[]): Promise<boolean>;

// Updates one or more entities.
update(entities: T | T[]): Promise<T | T[]>;
```

## Transaction support
This library was unfortunately developed without regard to transactions, but another library called [typeorm-transactional-cls-hooked](https://github.com/odavid/typeorm-transactional-cls-hooked) makes utilizing transations extremely easy!

To use this library in conjuntion with `typeorm-linq-repository`, install `typeorm-transactional-cls-hooked` along with its dependencies:

```
npm install --save typeorm-transactional-cls-hooked cls-hooked

npm install --save-dev @types/cls-hooked
```

Then, per `typeorm-transactional-cls-hooked`'s documentation, simply patch TypeORM's repository with `typeorm-transactional-cls-hooked`'s base repository when bootstrapping your app:

```ts
import { initializeTransactionalContext, patchTypeORMRepositoryWithBaseRepository } from "typeorm-transactional-cls-hooked";

// Initialize cls-hooked.
initializeTransactionalContext();
// Patch TypeORM's Repository with typeorm-transactional-cls-hooked's BaseRepository.
patchTypeORMRepositoryWithBaseRepository();
```

That's it! Now all you need to do is use `typeorm-transactional-cls-hooked`'s `@Transactional()` decorator on methods that persist entities to your repositories. See `typeorm-transactional-cls-hooked`'s for more details.
