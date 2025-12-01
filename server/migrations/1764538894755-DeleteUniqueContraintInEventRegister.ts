import { MigrationInterface, QueryRunner } from "typeorm";

export class DeleteUniqueContraintInEventRegister1764538894755 implements MigrationInterface {
    name = 'DeleteUniqueContraintInEventRegister1764538894755'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_register" DROP CONSTRAINT "UQ_67695eda41d78748b02958c31b8"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_register" ADD CONSTRAINT "UQ_67695eda41d78748b02958c31b8" UNIQUE ("userId", "eventPricingId")`);
    }

}
