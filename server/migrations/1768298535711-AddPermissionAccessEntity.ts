import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPermissionAccessEntity1768298535711 implements MigrationInterface {
    name = 'AddPermissionAccessEntity1768298535711'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."permission_access_permission_enum" AS ENUM('*', 'roles_create', 'roles_delete', 'roles_update', 'roles_view', 'events_create', 'events_delete', 'events_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'announcements_create', 'announcements_delete', 'announcements_update', 'association_update', 'association_remove')`);
        await queryRunner.query(`CREATE TABLE "permission_access" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "permission" "public"."permission_access_permission_enum" NOT NULL, "requiresSubscription" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_06cba8d955e785d04c802f23acc" UNIQUE ("permission"), CONSTRAINT "PK_5c12618e7f2ec71a83b72260deb" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "association" ADD "paymentServiceValidUntil" TIMESTAMP`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "paymentServiceValidUntil"`);
        await queryRunner.query(`DROP TABLE "permission_access"`);
        await queryRunner.query(`DROP TYPE "public"."permission_access_permission_enum"`);
    }

}
