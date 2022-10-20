import { DataSourceOptions } from "typeorm";
import * as ormconfig from "../../ormconfig.json";
import { Artist } from "../../test/entities/artist.entity";
import { Genre } from "../../test/entities/genre.entity";
import { Song } from "../../test/entities/song.entity";
import { UserProfileAttribute } from "../../test/entities/user-profile-attribute.entity";
import { User } from "../../test/entities/user.entity";

export const dataSourceOptions: DataSourceOptions = {
    ...ormconfig as DataSourceOptions,
    entities: [
        Artist,
        Genre,
        Song,
        UserProfileAttribute,
        User
    ]
};
