import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStripeAccountToAssociation1762167450188 implements MigrationInterface {
    name = 'AddStripeAccountToAssociation1762167450188'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" ADD "stripeAccountId" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "association" ADD "canReceiveDonations" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "canReceiveDonations"`);
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "stripeAccountId"`);
    }

}
