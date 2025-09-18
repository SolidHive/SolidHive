import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCoreEntities1758226152813 implements MigrationInterface {
    name = 'AddCoreEntities1758226152813'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_b23c65e50a758245a33ee35fda1"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_b23c65e50a758245a33ee35fda"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`CREATE TABLE "announcement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "content" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdById" uuid, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e0ef0550174fd1099a308fd18a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."association_role_permissions_enum" AS ENUM('manage_association', 'manage_users', 'manage_roles')`);
        await queryRunner.query(`CREATE TABLE "association_role" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(12) NOT NULL, "description" text, "permissions" "public"."association_role_permissions_enum" array NOT NULL DEFAULT '{}', "createdByUserId" uuid, "createdByAssociationId" uuid, "associationId" uuid, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_e96549c9d571d950adece80eb1e" UNIQUE ("name"), CONSTRAINT "PK_5b3f3ce0d1d7a0558cf1d81b97b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "fundraising" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "amount" double precision NOT NULL DEFAULT '0', "wantedAmount" double precision NOT NULL DEFAULT '0', "startDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "endDate" TIMESTAMP WITH TIME ZONE DEFAULT now(), "createdByUserId" uuid, "createdByAssociationId" uuid, "associationId" uuid, "imageAlt" character varying(255), "imageTitle" character varying(255), "imageFileOldfilename" character varying(255) NOT NULL, "imageFileFilename" character varying(255) NOT NULL, "imageFileExtension" character varying(10) NOT NULL, "imageFilePath" character varying(255) NOT NULL, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2b493d5862734cb2567b0c0b931" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_association" ("userId" uuid NOT NULL, "associationId" uuid NOT NULL, "roleId" uuid, CONSTRAINT "PK_d156fec5eab2d0ebc211879a1c7" PRIMARY KEY ("userId", "associationId"))`);
        await queryRunner.query(`CREATE TABLE "association_announcement" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "content" text NOT NULL, "isActive" boolean NOT NULL DEFAULT true, "createdByUserId" uuid, "createdByAssociationId" uuid, "associationId" uuid, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_ffaafdc856358de57e485ca0a15" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "association" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(100) NOT NULL, "description" text, "primaryColor" character varying(7) DEFAULT '#000000', "secondaryColor" character varying(7) DEFAULT '#000000', "contact" character varying(100), "createdById" uuid, "logoAlt" character varying(255), "logoTitle" character varying(255), "logoFileOldfilename" character varying(255) NOT NULL, "logoFileFilename" character varying(255) NOT NULL, "logoFileExtension" character varying(10) NOT NULL, "logoFilePath" character varying(255) NOT NULL, "backgroundAlt" character varying(255), "backgroundTitle" character varying(255), "backgroundFileOldfilename" character varying(255) NOT NULL, "backgroundFileFilename" character varying(255) NOT NULL, "backgroundFileExtension" character varying(10) NOT NULL, "backgroundFilePath" character varying(255) NOT NULL, "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now(), "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5c770cfef7a1f66da23be411699" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "favorite" ("relatedTo" character varying NOT NULL, "relatedBy" character varying NOT NULL, "userId" uuid NOT NULL, CONSTRAINT "PK_daaa18c2afefbbed7e7e99277dd" PRIMARY KEY ("relatedTo", "relatedBy", "userId"))`);
        await queryRunner.query(`CREATE TABLE "transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "amount" double precision NOT NULL, "category" character varying(25) NOT NULL, "invoiceOldfilename" character varying(255) NOT NULL, "invoiceFilename" character varying(255) NOT NULL, "invoiceExtension" character varying(10) NOT NULL, "invoicePath" character varying(255) NOT NULL, CONSTRAINT "PK_89eadb93a89810556e1cbcd6ab9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "amount" double precision NOT NULL DEFAULT '0', "startDate" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "endDate" TIMESTAMP WITH TIME ZONE DEFAULT now(), "imageAlt" character varying(255), "imageTitle" character varying(255), "imageFileOldfilename" character varying(255) NOT NULL, "imageFileFilename" character varying(255) NOT NULL, "imageFileExtension" character varying(10) NOT NULL, "imageFilePath" character varying(255) NOT NULL, "addressStreet" character varying(100) NOT NULL, "addressCity" character varying(100) NOT NULL, "addressState" character varying(100) NOT NULL, "addressPostcode" character varying(20) NOT NULL, "addressCountry" character varying(100) NOT NULL, "addressHousenumber" character varying(20), CONSTRAINT "PK_30c2f3bbaf6d34a55f8ae6e4614" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_pricing" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying(100) NOT NULL, "description" text, "amount" double precision NOT NULL DEFAULT '0', "eventId" uuid, CONSTRAINT "PK_64dc6705cb124439e71b026427c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "event_register" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "registeredAt" TIMESTAMP NOT NULL DEFAULT now(), "eventPricingId" uuid, CONSTRAINT "PK_105f02d2667607dec5c38e92999" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "updatedAt"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "createdAt"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_23ed6f04fe43066df08379fd034"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_87b8888186ca9769c960e926870" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "role_id"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "user_id"`);
        await queryRunner.query(`ALTER TABLE "user" ADD "timestampsCreated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "timestampsUpdated_at" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "userId" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_472b25323af01488f1f66a06b67" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "roleId" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475" PRIMARY KEY ("userId", "roleId")`);
        await queryRunner.query(`CREATE INDEX "IDX_472b25323af01488f1f66a06b6" ON "user_roles" ("userId") `);
        await queryRunner.query(`CREATE INDEX "IDX_86033897c009fcca8b6505d6be" ON "user_roles" ("roleId") `);
        await queryRunner.query(`ALTER TABLE "announcement" ADD CONSTRAINT "FK_30893a8cb5ee25374cfd9de9273" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association_role" ADD CONSTRAINT "FK_44bb4752822e856fbb80aa12912" FOREIGN KEY ("createdByUserId", "createdByAssociationId") REFERENCES "user_association"("userId","associationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association_role" ADD CONSTRAINT "FK_066fe7b887c6ba639f08646cd7e" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fundraising" ADD CONSTRAINT "FK_ce437aa227d054bc09dad0418a6" FOREIGN KEY ("createdByUserId", "createdByAssociationId") REFERENCES "user_association"("userId","associationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fundraising" ADD CONSTRAINT "FK_862dc826525676d160e4e53e0dd" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_association" ADD CONSTRAINT "FK_1796ce3755a55fe215824ca6dc2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_association" ADD CONSTRAINT "FK_c1a2509bb1fdefcee857c753ffb" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_association" ADD CONSTRAINT "FK_c1226e860f2759494503f28536f" FOREIGN KEY ("roleId") REFERENCES "association_role"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association_announcement" ADD CONSTRAINT "FK_4b61a0e5346ebf9f32056074710" FOREIGN KEY ("createdByUserId", "createdByAssociationId") REFERENCES "user_association"("userId","associationId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association_announcement" ADD CONSTRAINT "FK_6c5dc14f127c46a9951795c4178" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association" ADD CONSTRAINT "FK_fce9011643f10747ca4c9a41de7" FOREIGN KEY ("createdById") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "favorite" ADD CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_pricing" ADD CONSTRAINT "FK_fe82476564ec5330aba4954d259" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_register" ADD CONSTRAINT "FK_4fcef40ba2e0b205d729f0f7251" FOREIGN KEY ("eventPricingId") REFERENCES "event_pricing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_472b25323af01488f1f66a06b67" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_86033897c009fcca8b6505d6be2" FOREIGN KEY ("roleId") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_86033897c009fcca8b6505d6be2"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "event_register" DROP CONSTRAINT "FK_4fcef40ba2e0b205d729f0f7251"`);
        await queryRunner.query(`ALTER TABLE "event_pricing" DROP CONSTRAINT "FK_fe82476564ec5330aba4954d259"`);
        await queryRunner.query(`ALTER TABLE "favorite" DROP CONSTRAINT "FK_83b775fdebbe24c29b2b5831f2d"`);
        await queryRunner.query(`ALTER TABLE "association" DROP CONSTRAINT "FK_fce9011643f10747ca4c9a41de7"`);
        await queryRunner.query(`ALTER TABLE "association_announcement" DROP CONSTRAINT "FK_6c5dc14f127c46a9951795c4178"`);
        await queryRunner.query(`ALTER TABLE "association_announcement" DROP CONSTRAINT "FK_4b61a0e5346ebf9f32056074710"`);
        await queryRunner.query(`ALTER TABLE "user_association" DROP CONSTRAINT "FK_c1226e860f2759494503f28536f"`);
        await queryRunner.query(`ALTER TABLE "user_association" DROP CONSTRAINT "FK_c1a2509bb1fdefcee857c753ffb"`);
        await queryRunner.query(`ALTER TABLE "user_association" DROP CONSTRAINT "FK_1796ce3755a55fe215824ca6dc2"`);
        await queryRunner.query(`ALTER TABLE "fundraising" DROP CONSTRAINT "FK_862dc826525676d160e4e53e0dd"`);
        await queryRunner.query(`ALTER TABLE "fundraising" DROP CONSTRAINT "FK_ce437aa227d054bc09dad0418a6"`);
        await queryRunner.query(`ALTER TABLE "association_role" DROP CONSTRAINT "FK_066fe7b887c6ba639f08646cd7e"`);
        await queryRunner.query(`ALTER TABLE "association_role" DROP CONSTRAINT "FK_44bb4752822e856fbb80aa12912"`);
        await queryRunner.query(`ALTER TABLE "announcement" DROP CONSTRAINT "FK_30893a8cb5ee25374cfd9de9273"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_86033897c009fcca8b6505d6be"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_472b25323af01488f1f66a06b6"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_88481b0c4ed9ada47e9fdd67475"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_472b25323af01488f1f66a06b67" PRIMARY KEY ("userId")`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "roleId"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_472b25323af01488f1f66a06b67"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timestampsUpdated_at"`);
        await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "timestampsCreated_at"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "user_id" uuid NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_87b8888186ca9769c960e926870" PRIMARY KEY ("user_id")`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD "role_id" integer NOT NULL`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "PK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "PK_23ed6f04fe43066df08379fd034" PRIMARY KEY ("role_id", "user_id")`);
        await queryRunner.query(`ALTER TABLE "user" ADD "createdAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "user" ADD "updatedAt" TIMESTAMP NOT NULL DEFAULT now()`);
        await queryRunner.query(`DROP TABLE "event_register"`);
        await queryRunner.query(`DROP TABLE "event_pricing"`);
        await queryRunner.query(`DROP TABLE "event"`);
        await queryRunner.query(`DROP TABLE "transaction"`);
        await queryRunner.query(`DROP TABLE "favorite"`);
        await queryRunner.query(`DROP TABLE "association"`);
        await queryRunner.query(`DROP TABLE "association_announcement"`);
        await queryRunner.query(`DROP TABLE "user_association"`);
        await queryRunner.query(`DROP TABLE "fundraising"`);
        await queryRunner.query(`DROP TABLE "association_role"`);
        await queryRunner.query(`DROP TYPE "public"."association_role_permissions_enum"`);
        await queryRunner.query(`DROP TABLE "announcement"`);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_b23c65e50a758245a33ee35fda" ON "user_roles" ("role_id") `);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_b23c65e50a758245a33ee35fda1" FOREIGN KEY ("role_id") REFERENCES "role"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

}
