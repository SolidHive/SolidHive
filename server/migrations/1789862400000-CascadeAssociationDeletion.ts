import { MigrationInterface, QueryRunner } from "typeorm";

/**
 * Supprimer une association échouait (erreur 500) : ses annonces, rôles,
 * membres, cagnottes et événements la référençaient sans règle de suppression.
 * Ces lignes n'ont aucun sens sans leur association : elles partent avec elle,
 * de même que les tarifs et inscriptions d'un événement supprimé. Les
 * transactions et factures ne sont pas concernées : elles ne portent qu'un
 * identifiant texte et restent comme historique comptable.
 */
export class CascadeAssociationDeletion1789862400000 implements MigrationInterface {
    name = 'CascadeAssociationDeletion1789862400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association_announcement" DROP CONSTRAINT "FK_6c5dc14f127c46a9951795c4178"`);
        await queryRunner.query(`ALTER TABLE "association_announcement" ADD CONSTRAINT "FK_6c5dc14f127c46a9951795c4178" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association_role" DROP CONSTRAINT "FK_066fe7b887c6ba639f08646cd7e"`);
        await queryRunner.query(`ALTER TABLE "association_role" ADD CONSTRAINT "FK_066fe7b887c6ba639f08646cd7e" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_be6cda6a1704925d016fa33cb81"`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_be6cda6a1704925d016fa33cb81" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fundraising" DROP CONSTRAINT "FK_862dc826525676d160e4e53e0dd"`);
        await queryRunner.query(`ALTER TABLE "fundraising" ADD CONSTRAINT "FK_862dc826525676d160e4e53e0dd" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_association" DROP CONSTRAINT "FK_c1a2509bb1fdefcee857c753ffb"`);
        await queryRunner.query(`ALTER TABLE "user_association" ADD CONSTRAINT "FK_c1a2509bb1fdefcee857c753ffb" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_pricing" DROP CONSTRAINT "FK_fe82476564ec5330aba4954d259"`);
        await queryRunner.query(`ALTER TABLE "event_pricing" ADD CONSTRAINT "FK_fe82476564ec5330aba4954d259" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_register" DROP CONSTRAINT "FK_4fcef40ba2e0b205d729f0f7251"`);
        await queryRunner.query(`ALTER TABLE "event_register" ADD CONSTRAINT "FK_4fcef40ba2e0b205d729f0f7251" FOREIGN KEY ("eventPricingId") REFERENCES "event_pricing"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "association_announcement" DROP CONSTRAINT "FK_6c5dc14f127c46a9951795c4178"`);
        await queryRunner.query(`ALTER TABLE "association_announcement" ADD CONSTRAINT "FK_6c5dc14f127c46a9951795c4178" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "association_role" DROP CONSTRAINT "FK_066fe7b887c6ba639f08646cd7e"`);
        await queryRunner.query(`ALTER TABLE "association_role" ADD CONSTRAINT "FK_066fe7b887c6ba639f08646cd7e" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event" DROP CONSTRAINT "FK_be6cda6a1704925d016fa33cb81"`);
        await queryRunner.query(`ALTER TABLE "event" ADD CONSTRAINT "FK_be6cda6a1704925d016fa33cb81" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "fundraising" DROP CONSTRAINT "FK_862dc826525676d160e4e53e0dd"`);
        await queryRunner.query(`ALTER TABLE "fundraising" ADD CONSTRAINT "FK_862dc826525676d160e4e53e0dd" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_association" DROP CONSTRAINT "FK_c1a2509bb1fdefcee857c753ffb"`);
        await queryRunner.query(`ALTER TABLE "user_association" ADD CONSTRAINT "FK_c1a2509bb1fdefcee857c753ffb" FOREIGN KEY ("associationId") REFERENCES "association"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_pricing" DROP CONSTRAINT "FK_fe82476564ec5330aba4954d259"`);
        await queryRunner.query(`ALTER TABLE "event_pricing" ADD CONSTRAINT "FK_fe82476564ec5330aba4954d259" FOREIGN KEY ("eventId") REFERENCES "event"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "event_register" DROP CONSTRAINT "FK_4fcef40ba2e0b205d729f0f7251"`);
        await queryRunner.query(`ALTER TABLE "event_register" ADD CONSTRAINT "FK_4fcef40ba2e0b205d729f0f7251" FOREIGN KEY ("eventPricingId") REFERENCES "event_pricing"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
