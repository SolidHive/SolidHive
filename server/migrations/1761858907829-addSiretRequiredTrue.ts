import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSiretRequiredTrue1761858907829 implements MigrationInterface {
    name = 'AddSiretRequiredTrue1761858907829'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" ALTER COLUMN "siret" SET NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" ALTER COLUMN "siret" DROP NOT NULL`);
    }

}
