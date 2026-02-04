import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCreatedAtToUserAssociation1770152787898 implements MigrationInterface {
    name = 'AddCreatedAtToUserAssociation1770152787898'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_association" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_association" DROP COLUMN "createdAt"`);
    }

}
