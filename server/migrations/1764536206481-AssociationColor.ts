import { MigrationInterface, QueryRunner } from "typeorm";

export class AssociationColor1764536206481 implements MigrationInterface {
    name = 'AssociationColor1764536206481'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "secondaryColor"`);
        await queryRunner.query(`ALTER TABLE "association" ALTER COLUMN "primaryColor" DROP DEFAULT`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" ALTER COLUMN "primaryColor" SET DEFAULT '#000000'`);
        await queryRunner.query(`ALTER TABLE "association" ADD "secondaryColor" character varying(7) DEFAULT '#000000'`);
    }

}
