import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1629340508553 implements MigrationInterface {
    name = 'Initial1629340508553'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("CREATE TABLE `genre` (`id` int NOT NULL, `name` varchar(50) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `song` (`artistId` int NOT NULL, `genreId` int NOT NULL, `id` int NOT NULL, `name` varchar(100) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `artist` (`id` int NOT NULL, `name` varchar(100) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user` (`id` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `user_profile_attribute` (`genreId` int NOT NULL, `id` int NOT NULL, `userId` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("ALTER TABLE `song` ADD CONSTRAINT `FK_fe76da76684ccb3d70d0f75994e` FOREIGN KEY (`artistId`) REFERENCES `artist`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `song` ADD CONSTRAINT `FK_d9ffa20e72f9e6834680ead9fe4` FOREIGN KEY (`genreId`) REFERENCES `genre`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_profile_attribute` ADD CONSTRAINT `FK_2e584d105f300ed4f325ba0a43c` FOREIGN KEY (`genreId`) REFERENCES `genre`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
        await queryRunner.query("ALTER TABLE `user_profile_attribute` ADD CONSTRAINT `FK_6689edd2d3aced2ac9510387a06` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION");
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query("ALTER TABLE `user_profile_attribute` DROP FOREIGN KEY `FK_6689edd2d3aced2ac9510387a06`");
        await queryRunner.query("ALTER TABLE `user_profile_attribute` DROP FOREIGN KEY `FK_2e584d105f300ed4f325ba0a43c`");
        await queryRunner.query("ALTER TABLE `song` DROP FOREIGN KEY `FK_d9ffa20e72f9e6834680ead9fe4`");
        await queryRunner.query("ALTER TABLE `song` DROP FOREIGN KEY `FK_fe76da76684ccb3d70d0f75994e`");
        await queryRunner.query("DROP TABLE `user_profile_attribute`");
        await queryRunner.query("DROP TABLE `user`");
        await queryRunner.query("DROP TABLE `artist`");
        await queryRunner.query("DROP TABLE `song`");
        await queryRunner.query("DROP TABLE `genre`");
    }

}
