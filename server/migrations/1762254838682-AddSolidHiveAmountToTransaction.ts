import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSolidHiveAmountToTransaction1762254838682 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ADD "solidHiveAmount" float`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" DROP COLUMN "solidHiveAmount"`);
    }

}
