import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAmountToEventPricing1764061185265 implements MigrationInterface {
    name = 'AddAmountToEventPricing1764061185265'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_pricing" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "event_pricing" ADD "amount" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_pricing" DROP COLUMN "amount"`);
        await queryRunner.query(`ALTER TABLE "event_pricing" ADD "amount" double precision NOT NULL DEFAULT '0'`);
    }

}
