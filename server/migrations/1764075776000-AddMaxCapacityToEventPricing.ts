import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddMaxCapacityToEventPricing1764075776000 implements MigrationInterface {
  name = 'AddMaxCapacityToEventPricing1764075776000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_pricing" ADD "maxCapacity" integer`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "event_pricing" DROP COLUMN "maxCapacity"`);
  }
}
