import { DataSource } from "typeorm";
import { getTypeormDataSource } from "../../../.typeorm/connection/get-typeorm-data-source.function";
import { LinqRepository } from "../../../src/repository/LinqRepository";
import { Artist } from "../../entities/artist.entity";
import { Song } from "../../entities/song.entity";
import { UserProfileAttribute } from "../../entities/user-profile-attribute.entity";

describe("Query", () => {
    let dataSource: DataSource;

    let artistRepository: LinqRepository<Artist>;
    let songRepository: LinqRepository<Song>;

    beforeAll(async () => {
        dataSource = await getTypeormDataSource();

        artistRepository = new LinqRepository(dataSource, Artist);
        songRepository = new LinqRepository(dataSource, Song);
    });

    it("gets all entities", async () => {
        const artists = await artistRepository.getAll();

        expect(artists.length)
            .toBe(3);
    });

    it("gets many entities", async () => {
        const rockSongs = await songRepository
            .getAll()
            .where(s => s.genreId)
            .equal(1);

        expect(rockSongs.length)
            .toBe(3);
    });

    it("gets one entity", async () => {
        const song = await songRepository
            .getOne()
            .where(s => s.artistId)
            .equal(1)
            .and(s => s.genreId)
            .equal(3);

        expect(song)
            .not
            .toBeUndefined();
    });

    it("gets entity by id", async () => {
        const song = await songRepository.getById(1);

        expect(song)
            .not
            .toBeUndefined();
    });

    it("counts entities", async () => {
        const rockSongCount = await songRepository
            .getAll()
            .where(s => s.genreId)
            .equal(1)
            .count();

        expect(rockSongCount)
            .toBe(3);
    });

    it("includes entities", async () => {
        const song = await songRepository
            .getById(1)
            .include(s => s.artist)
            .include(s => s.genre);

        expect(song.artist)
            .not
            .toBeUndefined();
        expect(song.genre)
            .not
            .toBeUndefined();
    });

    it("isolates and conditions", async () => {
        const songs = await songRepository
            .getAll()
            .where(s => s.artistId)
            .equal(1)
            .isolatedAnd(q => q
                .where(s => s.genreId)
                .equal(1)
                .or(s => s.genreId)
                .equal(2)
            );

        expect(songs.length)
            .toBe(2);
    });

    it("isolates or conditions", async () => {
        const songs = await songRepository
            .getAll()
            .where(s => s.artistId)
            .equal(1)
            .isolatedOr(q => q
                .where(s => s.genreId)
                .notEqual(2)
                .and(s => s.genreId)
                .notEqual(3)
            );

        expect(songs.length)
            .toBe(5);
    });

    it("joins mapped relations (without parens)", async () => {
        const artists = await artistRepository
            .getAll()
            .where(a => a.songs.map(s => s.genreId))
            .equal(1);

        expect(artists.length)
            .toBe(3);
    });

    it("joins mapped relations (with parens)", async () => {
        const artists = await artistRepository
            .getAll()
            // tslint:disable-next-line: arrow-parens
            .where((a) => a.songs.map((s) => s.genreId))
            .equal(1);

        expect(artists.length)
            .toBe(3);
    });

    it("filters where any (without condition)", async () => {
        const artists = await artistRepository
            .getAll()
            .whereAny(a => a.songs, s => s.id)
            // Must add all columns to group by to mitigate
            // "incompatible with sql_mode=only_full_group_by" errors in mysql...
            .reset()
            .groupBy(a => a.id)
            .thenGroupBy(a => a.name);

        expect(artists.length)
            .toBe(3);
    });

    it("filters where any (with condition)", async () => {
        const artists = await artistRepository
            .getAll()
            .whereAny(a => a.songs, s => s.id, s => s.genreId)
            .equal(2)
            // Must add all columns to group by to mitigate
            // "incompatible with sql_mode=only_full_group_by" errors in mysql...
            .reset()
            .groupBy(a => a.id)
            .thenGroupBy(a => a.name);

        expect(artists.length)
            .toBe(2);
    });

    it("filters where none (without condition)", async () => {
        const artists = await artistRepository
            .getAll()
            .whereNone(a => a.songs, s => s.id)
            // Must add all columns to group by to mitigate
            // "incompatible with sql_mode=only_full_group_by" errors in mysql...
            .reset()
            .groupBy(a => a.id)
            .thenGroupBy(a => a.name);

        expect(artists.length)
            .toBe(0);
    });

    it("filters where none (with condition)", async () => {
        const artists = await artistRepository
            .getAll()
            .whereNone(a => a.songs, s => s.id, s => s.genreId)
            .equal(2)
            // Must add all columns to group by to mitigate
            // "incompatible with sql_mode=only_full_group_by" errors in mysql...
            .reset()
            .groupBy(a => a.id)
            .thenGroupBy(a => a.name);

        expect(artists.length)
            .toBe(1);
    });

    it("works with inner queries", async () => {
        const songs = await songRepository
            .getAll()
            .join(s => s.artist)
            .where(a => a.id)
            .equal(1)
            .where(s => s.id)
            .notInSelected(
                songRepository
                    .getAll()
                    .join(s => s.artist)
                    .where(a => a.id)
                    .equal(1)
                    .from(UserProfileAttribute)
                    .thenJoin(upa => upa.genre)
                    .where(g => g.id)
                    .join(s => s.genre)
                    .equalJoined(g => g.id)
                    .from(UserProfileAttribute)
                    .thenJoin(upa => upa.user)
                    .where(u => u.id)
                    .equal(1)
                    .select(s => s.id)
            );

        expect(songs.length)
            .toBe(2);
    });

    afterAll(async () => {
        await dataSource.destroy();
    });
});
