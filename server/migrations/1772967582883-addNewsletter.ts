import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewsletter1772967582883 implements MigrationInterface {
    name = 'AddNewsletter1772967582883'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "newsletter_subscriber" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "email" character varying NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_c7c77fa243eefb2415b13f1b4e4" UNIQUE ("email"), CONSTRAINT "PK_673f5f9a16ef0e216059224e02f" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "newsletter_subscriber"`);
    }

}
