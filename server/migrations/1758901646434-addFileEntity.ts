import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFileEntity1758901646434 implements MigrationInterface {
    name = 'AddFileEntity1758901646434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "file" ("relatedTo" character varying NOT NULL, "relatedBy" character varying NOT NULL, "purpose" character varying NOT NULL, "index" integer NOT NULL DEFAULT '0', "userId" uuid NOT NULL, "oldFilename" character varying NOT NULL, "filename" character varying NOT NULL, "mimetype" character varying NOT NULL, "extension" character varying NOT NULL, "size" integer NOT NULL, "additional" text, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_a9c69888b5b3913ca851bc172d1" UNIQUE ("relatedTo", "relatedBy", "index"), CONSTRAINT "PK_079673c22f12646bf632d8aa09d" PRIMARY KEY ("relatedTo", "relatedBy", "index", "userId"))`);
        await queryRunner.query(`CREATE TABLE "file_system_roles" ("fileRelatedTo" character varying NOT NULL, "fileRelatedBy" character varying NOT NULL, "fileIndex" integer NOT NULL, "fileUserId" uuid NOT NULL, "roleId" integer NOT NULL, CONSTRAINT "PK_89a701b17d23f0c2e28cca3363e" PRIMARY KEY ("fileRelatedTo", "fileRelatedBy", "fileIndex", "fileUserId", "roleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_74b3e0e8663f04e14df0dedcc0" ON "file_system_roles" ("fileRelatedTo", "fileRelatedBy", "fileIndex", "fileUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_d70633956c73a17a0c372a3d4c" ON "file_system_roles" ("roleId") `);
        await queryRunner.query(`CREATE TABLE "file_association_roles" ("fileRelatedTo" character varying NOT NULL, "fileRelatedBy" character varying NOT NULL, "fileIndex" integer NOT NULL, "fileUserId" uuid NOT NULL, "associationRoleId" uuid NOT NULL, CONSTRAINT "PK_c4cff8ae6feb9bc0ad5f095506c" PRIMARY KEY ("fileRelatedTo", "fileRelatedBy", "fileIndex", "fileUserId", "associationRoleId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_98db778e72be747ba991963df2" ON "file_association_roles" ("fileRelatedTo", "fileRelatedBy", "fileIndex", "fileUserId") `);
        await queryRunner.query(`CREATE INDEX "IDX_95cb3c2c72587bacb46b9381e9" ON "file_association_roles" ("associationRoleId") `);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum" RENAME TO "association_role_permissions_enum_old"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum" AS ENUM('*', 'roles_create', 'roles_delete', 'roles_update', 'roles_view', 'events_create', 'events_delete', 'events_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'announcements_create', 'announcements_delete', 'announcements_update', 'association_update', 'association_remove')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum"[] USING "permissions"::"text"::"public"."association_role_permissions_enum"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum_old"`);
        await queryRunner.query(`ALTER TABLE "file" ADD CONSTRAINT "FK_b2d8e683f020f61115edea206b3" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" ADD CONSTRAINT "FK_74b3e0e8663f04e14df0dedcc0c" FOREIGN KEY ("fileRelatedTo", "fileRelatedBy", "fileIndex", "fileUserId") REFERENCES "file"("relatedTo","relatedBy","index","userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" ADD CONSTRAINT "FK_d70633956c73a17a0c372a3d4c7" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "file_association_roles" ADD CONSTRAINT "FK_98db778e72be747ba991963df25" FOREIGN KEY ("fileRelatedTo", "fileRelatedBy", "fileIndex", "fileUserId") REFERENCES "file"("relatedTo","relatedBy","index","userId") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "file_association_roles" ADD CONSTRAINT "FK_95cb3c2c72587bacb46b9381e9c" FOREIGN KEY ("associationRoleId") REFERENCES "association_role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "file_association_roles" DROP CONSTRAINT "FK_95cb3c2c72587bacb46b9381e9c"`);
        await queryRunner.query(`ALTER TABLE "file_association_roles" DROP CONSTRAINT "FK_98db778e72be747ba991963df25"`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" DROP CONSTRAINT "FK_d70633956c73a17a0c372a3d4c7"`);
        await queryRunner.query(`ALTER TABLE "file_system_roles" DROP CONSTRAINT "FK_74b3e0e8663f04e14df0dedcc0c"`);
        await queryRunner.query(`ALTER TABLE "file" DROP CONSTRAINT "FK_b2d8e683f020f61115edea206b3"`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum_old" AS ENUM('*', 'announcements_create', 'announcements_delete', 'announcements_update', 'events_create', 'events_delete', 'events_update', 'fundraisings_create', 'fundraisings_delete', 'fundraisings_update', 'registers_create', 'registers_delete', 'registers_update', 'registers_view', 'roles_create', 'roles_delete', 'roles_update', 'roles_view')`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" TYPE "public"."association_role_permissions_enum_old"[] USING "permissions"::"text"::"public"."association_role_permissions_enum_old"[]`);
        await queryRunner.query(`ALTER TABLE "association_role" ALTER COLUMN "permissions" SET DEFAULT '{}'`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum"`);
        await queryRunner.query(`ALTER TYPE "public"."association_role_permissions_enum_old" RENAME TO "association_role_permissions_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_95cb3c2c72587bacb46b9381e9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_98db778e72be747ba991963df2"`);
        await queryRunner.query(`DROP TABLE "file_association_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d70633956c73a17a0c372a3d4c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_74b3e0e8663f04e14df0dedcc0"`);
        await queryRunner.query(`DROP TABLE "file_system_roles"`);
        await queryRunner.query(`DROP TABLE "file"`);
    }

}
