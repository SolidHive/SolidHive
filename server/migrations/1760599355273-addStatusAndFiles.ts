import { MigrationInterface, QueryRunner } from "typeorm";

export class AddStatusAndFiles1760599355273 implements MigrationInterface {
    name = 'AddStatusAndFiles1760599355273'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("filename" character varying NOT NULL, "relatedTo" character varying NOT NULL, "relatedBy" character varying NOT NULL, "purpose" character varying NOT NULL, "index" integer NOT NULL DEFAULT '0', "userId" uuid NOT NULL, "oldFilename" character varying NOT NULL, "mimetype" character varying NOT NULL, "extension" character varying NOT NULL, "size" integer NOT NULL, "additional" text, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_7f83f7edf60a57a90ff1071d931" UNIQUE ("relatedTo", "relatedBy", "index", "purpose"), CONSTRAINT "PK_51e2d4c72df88f28a560615379f" PRIMARY KEY ("filename"))`);
        await queryRunner.query(`CREATE TABLE "file_system_roles" ("fileFilename" character varying NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_c1b61821fa4bc81d77b43ce292f" PRIMARY KEY ("fileFilename", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_13fa566a7b26b81725d6029c72" ON "file_system_roles" ("fileFilename") `);
        await queryRunner.query(`CREATE INDEX "IDX_d70633956c73a17a0c372a3d4c" ON "file_system_roles" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "file_association_roles" ("fileFilename" character varying NOT NULL, "associationRoleId" uuid NOT NULL, CONSTRAINT "PK_901b4486708ddf84d90c375c2c1" PRIMARY KEY ("fileFilename", "associationRoleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e0d784b94cee84f6669499078a" ON "file_association_roles" ("fileFilename") `);
        await queryRunner.query(`CREATE INDEX "IDX_95cb3c2c72587bacb46b9381e9" ON "file_association_roles" ("associationRoleId") `);
        await queryRunner.query(`CREATE TYPE "public"."user_association_status_enum" AS ENUM('accepted', 'pending', 'rejected', 'draft', 'additional_request')`);
        await queryRunner.query(`ALTER TABLE "user_association" ADD "status" "public"."user_association_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`CREATE TYPE "public"."association_status_enum" AS ENUM('accepted', 'pending', 'rejected', 'draft', 'additional_request')`);
        await queryRunner.query(`ALTER TABLE "association" ADD "status" "public"."association_status_enum" NOT NULL DEFAULT 'pending'`);
        await queryRunner.query(`ALTER TABLE "association" ADD "additionalRequest" text`);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum" RENAME TO "association_role_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum" AS ENUM('*', 'roles_create', 'roles_delete', 'roles_update', 'roles_view', 'events_create', 'events_delete', 'events_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'announcements_create', 'announcements_delete', 'announcements_update', 'association_update', 'association_remove')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum"[] USING "permissions"::"text"::"public"."association_role_permissions_enum"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum_old"`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_b2d8e683f020f61115edea206b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" ADD CONSTRAINT "FK_13fa566a7b26b81725d6029c72c" FOREIGN KEY ("fileFilename") REFERENCES "file"("filename") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" ADD CONSTRAINT "FK_d70633956c73a17a0c372a3d4c7" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "file_association_roles" ADD CONSTRAINT "FK_e0d784b94cee84f6669499078aa" FOREIGN KEY ("fileFilename") REFERENCES "file"("filename") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "file_association_roles" ADD CONSTRAINT "FK_95cb3c2c72587bacb46b9381e9c" FOREIGN KEY ("associationRoleId") REFERENCES "association_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_association_roles" DROP CONSTRAINT "FK_95cb3c2c72587bacb46b9381e9c"`);
        await queryRunner.query(`ALTER TABLE "file_association_roles" DROP CONSTRAINT "FK_e0d784b94cee84f6669499078aa"`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" DROP CONSTRAINT "FK_d70633956c73a17a0c372a3d4c7"`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" DROP CONSTRAINT "FK_13fa566a7b26b81725d6029c72c"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_b2d8e683f020f61115edea206b3"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum_old" AS ENUM('*', 'announcements_create', 'announcements_delete', 'announcements_update', 'events_create', 'events_delete', 'events_update', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'roles_create', 'roles_delete', 'roles_update', 'roles_view')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum_old"[] USING "permissions"::"text"::"public"."association_role_permissions_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum_old" RENAME TO "association_role_permissions_enum"`);
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "additionalRequest"`);
        await queryRunner.query(`ALTER TABLE "association" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."association_status_enum"`);
        await queryRunner.query(`ALTER TABLE "user_association" DROP COLUMN "status"`);
        await queryRunner.query(`DROP TYPE "public"."user_association_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95cb3c2c72587bacb46b9381e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e0d784b94cee84f6669499078a"`);
        await queryRunner.query(`DROP TABLE "file_association_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d70633956c73a17a0c372a3d4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_13fa566a7b26b81725d6029c72"`);
        await queryRunner.query(`DROP TABLE "file_system_roles"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
