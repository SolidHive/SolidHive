import { MigrationInterface, QueryRunner } from "typeorm";

export class AddNewPermissions1758476212172 implements MigrationInterface {
    name = 'AddNewPermissions1758476212172'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum" RENAME TO "association_role_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum" AS ENUM('*', 'roles_create', 'roles_delete', 'roles_update', 'roles_view', 'events_create', 'events_delete', 'events_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'announcements_create', 'announcements_delete', 'announcements_update')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum"[] USING "permissions"::"text"::"public"."association_role_permissions_enum"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum_old"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum_old" AS ENUM('*', 'manage_association', 'manage_users', 'manage_roles')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum_old"[] USING "permissions"::"text"::"public"."association_role_permissions_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum_old" RENAME TO "association_role_permissions_enum"`);
    }

}
