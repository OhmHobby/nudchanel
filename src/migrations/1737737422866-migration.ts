import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737737422866 implements MigrationInterface {
  name = 'Migration1737737422866'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "data_migrations" ("id" character varying(31) NOT NULL, CONSTRAINT "PK_8195df27e87de424a1d1250cdc9" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "data_migrations"`)
  }
}
