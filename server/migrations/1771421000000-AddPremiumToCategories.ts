import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPremiumToCategories1771421000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TYPE "transaction_relatedto_enum" ADD VALUE IF NOT EXISTS 'Premium'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Note: PostgreSQL ne permet pas de supprimer une valeur d'un enum directement
    // Il faudrait recréer l'enum et les tables associées pour le rollback
    // Pour simplifier, on laisse la valeur en place
  }
}
