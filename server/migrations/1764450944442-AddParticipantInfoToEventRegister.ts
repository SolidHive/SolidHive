import { MigrationInterface, QueryRunner } from "typeorm";

export class AddParticipantInfoToEventRegister1764450944442 implements MigrationInterface {
    name = 'AddParticipantInfoToEventRegister1764450944442'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_register" ADD "participantLastName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_register" ADD "participantFirstName" character varying(255)`);
        await queryRunner.query(`ALTER TABLE "event_register" ADD "participantEmail" character varying(255)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "event_register" DROP COLUMN "participantEmail"`);
        await queryRunner.query(`ALTER TABLE "event_register" DROP COLUMN "participantFirstName"`);
        await queryRunner.query(`ALTER TABLE "event_register" DROP COLUMN "participantLastName"`);
    }

}
