import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAboutTextToAssociation1760965505463 implements MigrationInterface {
    name = 'AddAboutTextToAssociation1760965505463'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" ADD "aboutText" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "aboutText"`);
    }

}
