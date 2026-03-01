import { MigrationInterface, QueryRunner } from "typeorm";

export class AddcancelledAt1770927827981 implements MigrationInterface {
    name = 'AddcancelledAt1770927827981'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_register" ADD "cancelledAt" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_register" DROP COLUMN "cancelledAt"`);
    }

}
