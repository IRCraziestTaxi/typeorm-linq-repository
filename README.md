# typeorm-linq-repository
Wraps TypeORM repository pattern and QueryBuilder using fluent, LINQ-style queries.

## What's New
As of version 1.0.0-alpha.1, inner queries are now supported! That is, you may perform the equivalent of `WHERE "entity"."id" <IN/NOT IN> (SELECT ...)` using `typeorm-linq-repository`.

Additionally, inner joins are made more intuitive and foreign entities may also be joined for more complex relational joining.

## Foreword
This is a work in progress. This project is currently in alpha and should be treated as such. That being said, it is finally receiving a massive update after six months of inactivity, so I hope it will continue to see lots of use and continue to mature.

`typeorm-linq-repository`'s queries handle simple includes, joins, and join conditions very well and now has the capability to take on more complex queries. The only way it will continue to mature is to have its limits tested see some issues and pull requests come in.

### Prerequisites
[TypeORM](https://github.com/typeorm/typeorm "TypeORM"), a code-first relational database ORM for typescript, is the foundation of this project. If you are unfamiliar with TypeORM, I strongly suggest that you check it out.

TypeORM has changed a lot since this project's conception; as such, the legacy version of this library is now completely unsupported. This project will continue to stay up-to-date with TypeORM's changes.

## Installation
To add `typeorm-linq-repository` and its dependencies to your project using NPM:

```
npm install --save typeorm typeorm-linq-repository
```

## Base Repository
RepositoryBase takes a class type representing a TypeORM model as its constructor argument.

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
    public constructor() {
        super(User);
    }
}
```

### Injecting RepositoryBase
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
This LINQ-style querying really shines by giving you type-safe includes, joins, and where statements, eliminating the need for hard-coded property names in query functions.

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
Include statements transform the "current property type" on the Query so that subsequent `thenInclude()`s can be executed while maintaining this type safety.

```typescript
this._userRepository.getById(id).include(u => u.orders).thenInclude(o => o.items);
```

```typescript
this._userRepository.getById(id).include(u => u.posts).thenInclude(p => p.comments).thenInclude(c => c.user);
```

You can use `include()` or `thenInclude()` on the same property more than once to subsequently include another relation without duplicating the include in the executed query.

```typescript
this._userRepository.getById(id).include(u => u.posts).thenInclude(p => p.comments).include(u => u.posts).thenInclude(p => p.subscribedUsers);
```

### Base Type
The query can be returned to its base type after a sequence of includes using `usingBaseType()`:

```typescript
this._userRepository.getAll().include(u => u.posts).thenInclude(p => p.comments).usingBaseType().orderBy(u => u.email);
```

Using `include()` after one or more `thenInclude()`s will also return the query to its base type:

```typescript
this._userRepository.getById(id).include(u => u.posts).thenInclude(p => p.comments).include(u => u.orders).thenInclude(o => o.items);
```

### Filtering Results
Queries can be filtered on one or more conditions using `where()`, `and()`, and `or()`. Note that, just as with TypeORM's QueryBuilder, using `where()` more than once will overwrite previous `where()`s, so use `and()` and `or()` to add more conditions.

```typescript
this._userRepository.getAll().where(u => u.isActive).isTrue().and(u => u.lastLogin).greaterThan(date);
```

Note also that this caveat only applies to "normal" where conditions; a where condition on a join is local to that join and does not affect any "normal" where conditions on a query.

```typescript
this._postRepository.getAll().join((p: IPost) => p.user).where((u: IUser) => u.id).equal(id).where((p: IPost) => p.archived).isTrue();
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

### Inner Joins
Filter joined relations by using `where()`, `and()`, and `or()` on inner joins using `join()` and `thenJoin()`.

```typescript
this._userRepository.getAll().join(u => u.posts).where(p => p.archived).isTrue();

this._userRepository.getOne().join(u => u.posts).where(p => p.flagged).isTrue().and(p => p.date).greaterThan(date);
```

Just as with `include()` and `thenInclude()`, `join()` always uses the query's base type, while `thenJoin()` continues to use the last joined entity's type.

```typescript
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

### Filtering Included Relationships
Similarly, you may filter included relationships using `where()`, `and()`, and `or()`.

```typescript
this._userRepository.include(u => u.posts).where(p => p.archived).isFalse().thenInclude(p => p.comments).where(c => c.flagged).isTrue();
```

### Joining Foreign Entities
Join from an unrelated entity using `from()`. A simple example of this is not easily provided, so see examples below for further guidance on using this method.

```typescript
this._songRepository.getAll().join(s => s.artist).where(a => a.id).equal(artistId).from<IUserProfileAttribute>(UserProfileAttribute).thenJoin(p => p.genre)/* ... */
```

Note that the type argument `IUserProfileAttribute` is not required, but is used in order to project the interface rather than the concrete type of `UserProfileAttribute` as the query's current property type.

### Comparing Values With Joined Entities
Perform comparisons with values on joined entities by calling `from()`, `join()`, and `thenJoin()` after calling `where()`, `and()`, or `or()`.

```typescript
this._userRepository.getAll().join(u => u.posts).where(p => p.recordLikeCount).thenJoin(p => p.category).greaterThanJoined(c => c.averageLikeCount);
```

The following query conditions are available for comparisons on related entities' properties:

`equalJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is equal to the specified property on the last joined entity.

`greaterThanJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is less than the specified property on the last joined entity.

`greaterThanOrEqualJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is greater than or equal to the specified property on the last joined entity.

`lessThanJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is less than the specified property on the last joined entity.

`lessThanOrEqualJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is less than or equal to the specified property on the last joined entity.

`notEqualJoined(selector: (obj: P) => any)`: Determines whether the property specified in the last "where" is not equal to the specified property on the last joined entity.

### Including or Excluding Results Within an Inner Query
To utilize an inner query, use the `inSelected()` and `notInSelected()` methods. Each takes an inner `ISelectQuery`, which is obtained by calling `select()` on the inner query after its construction and simply specifies which value to select from the inner query to project to the `IN` or `NOT IN` list.

The following example is overkill since, in reality, you would simply add the condition that the post is not archived on the main query, but consider what is going on within the queries in order to visualize how inner queries in `typeorm-linq-repository` work.

Consider a `PostRepository` from which we want to get all posts belonging to a certain user and only those that are not archived. The outer query in this instance gets all posts belonging to the specified user, while the inner query specified all posts that are not archived. The union of the two produces the results we want.

```typescript
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
```typescript
import { IArtist } from "./interfaces/IArtist";
import { Song } from "./Song";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Artist implements IArtist {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @OneToMany((type: any) => Song, (song: Song) => song.artist)
    public songs: Song[];
}
```

`Genre.ts`
```typescript
import { IGenre } from "./interfaces/IGenre";
import { SongGenre } from "./SongGenre";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Genre implements IGenre {
    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;

    @OneToMany((type: any) => SongGenre, (songGenre: SongGenre) => songGenre.genre)
    public songs: SongGenre[];
}
```

`Song.ts`
```typescript
import { ISong } from "./interfaces/ISong";
import { Artist } from "./Artist";
import { SongGenre } from "./SongGenre";
import { Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Song implements ISong {
    @ManyToOne((type: any) => Artist, (artist: Artist) => artist.songs)
    public artist: Artist;

    @OneToMany((type: any) => SongGenre, (songGenre: SongGenre) => songGenre.song)
    public genres: SongGenre[];

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public name: string;
}
```

`SongGenre.ts`
```typescript
import { ISongGenre } from "./interfaces/ISongGenre";
import { Genre } from "./Genre";
import { Song } from "./Song";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

/**
 * Links a song to a genre.
 */
@Entity()
export class Song implements ISong {
    @ManyToOne((type: any) => Genre, (genre: Genre) => genre.songs)
    public genre: Genre;

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type: any) => Song, (song: Song) => song.genres)
    public song: Song;
}
```

`User.ts`
```typescript
import { IUser } from "./interfaces/IUser";
import { UserProfileAttribute } from "./UserProfileAttribute";
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User implements IUser {
    @Column({ nullable: false })
    public email: string;

    @PrimaryGeneratedColumn()
    public id: number;

    @Column({ nullable: false })
    public password: string;

    @OneToMany((type: any) => UserProfileAttribute, (profileAttribute: UserProfileAttribute) => profileAttribute.user)
    public profile: UserProfileAttribute[];
}
```

`UserProfileAttribute.ts`
```typescript
import { IUserProfileAttribute } from "./interfaces/IUserProfileAttribute";
import { Genre } from "./Genre";
import { User } from "./User";
import { Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

/**
 * An attribute of a user's profile specifying a genre that user does not wish to hear.
 */
@Entity()
export class UserProfileAttribute implements IUserProfileAttribute {
    @ManyToOne((type: any) => Genre)
    public genre: Genre;

    @PrimaryGeneratedColumn()
    public id: number;

    @ManyToOne((type: any) => User, (user: User) => user.profile)
    public user: User;
}
```

Now, consider the following query from which we want to gather all songs by a certain artist that a certain user wants to hear; that is, songs by that artist that do not match a genre blocked by the user's profile.

```typescript
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
            .from<IUserProfileAttribute>(UserProfileAttribute)
            .thenJoin(p => p.genre)
            .where(g => g.id)
            .join(s => s.songGenre)
            .thenJoin(sg => sg.genre)
            .equalJoined(g.id)
            .from<IUserProfileAttribute>(UserProfileAttribute)
            .thenJoin(p => p.user)
            .where(u => u.id)
            .equal(userId)
            .select(s => s.id)
    );
```

Note that the type argument `IUserProfileAttribute` is not required, but is used in order to project the interface rather than the concrete type of `UserProfileAttribute` as the query's current property type.

### Selection Type
Calling `select()` after completing any comparison operations uses the query's base type. If you wish to select a property from a relation rather than the query's base type, you may call `select()` after one or more joins on the query.

```typescript
this._songRepository.getAll().join(s => s.genres).thenJoin(sg => sg.genre).select(g => g.id);
```

### Ordering Queries
You can order queries in either direction and using as many subsequent order statements as needed.

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

### Using TypeORM's Query Builder
If you encounter an issue or a query which this query wrapper cannot accommodate, you can use TypeORM's native QueryBuilder.

```typescript
this._userRepository.createQueryBuilder("user");
```