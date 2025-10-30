import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSiretAssociation1761775645341 implements MigrationInterface {
    name = 'AddSiretAssociation1761775645341'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "siret"`);
        await queryRunner.query(`ALTER TABLE "association" ADD "siret" character varying(14)`);
        await queryRunner.query(`ALTER TABLE "association" ADD CONSTRAINT "UQ_ceee675aefe0bb8f10f54db1696" UNIQUE ("siret")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" DROP CONSTRAINT "UQ_ceee675aefe0bb8f10f54db1696"`);
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "siret"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "siret" character varying(14) NOT NULL`);
    }

}
