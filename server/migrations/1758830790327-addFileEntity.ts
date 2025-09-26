import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileEntity1758830790327 implements MigrationInterface {
    name = 'AddFileEntity1758830790327'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("relatedTo" character varying NOT NULL, "relatedBy" character varying NOT NULL, "index" integer NOT NULL DEFAULT '0', "userId" uuid NOT NULL, "oldFilename" character varying NOT NULL, "filename" character varying NOT NULL, "mimetype" character varying NOT NULL, "extension" character varying NOT NULL, "size" integer NOT NULL, "isPrivate" boolean NOT NULL DEFAULT true, "additional" text, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a9c69888b5b3913ca851bc172d1" UNIQUE ("relatedTo", "relatedBy", "index"), CONSTRAINT "PK_079673c22f12646bf632d8aa09d" PRIMARY KEY ("relatedTo", "relatedBy", "index", "userId"))`);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum" RENAME TO "association_role_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum" AS ENUM('*', 'roles_create', 'roles_delete', 'roles_update', 'roles_view', 'events_create', 'events_delete', 'events_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'announcements_create', 'announcements_delete', 'announcements_update', 'association_update', 'association_remove')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum"[] USING "permissions"::"text"::"public"."association_role_permissions_enum"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum_old"`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_b2d8e683f020f61115edea206b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_b2d8e683f020f61115edea206b3"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum_old" AS ENUM('*', 'announcements_create', 'announcements_delete', 'announcements_update', 'events_create', 'events_delete', 'events_update', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'roles_create', 'roles_delete', 'roles_update', 'roles_view')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum_old"[] USING "permissions"::"text"::"public"."association_role_permissions_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum_old" RENAME TO "association_role_permissions_enum"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
