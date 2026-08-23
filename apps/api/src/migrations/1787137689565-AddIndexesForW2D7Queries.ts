import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexesForW2D7Queries1787137689565 implements MigrationInterface {
  name = 'AddIndexesForW2D7Queries1787137689565';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "IDX_b25a43d9925753ce3bf4023459" ON "task" ("userId", "dueDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_99f35200a35a560bd9aa5703f7" ON "task" ("status", "dueDate") `,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_8bf6d736c49d48d91691ea0dfe" ON "task" ("parentTaskId") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8bf6d736c49d48d91691ea0dfe"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_99f35200a35a560bd9aa5703f7"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."IDX_b25a43d9925753ce3bf4023459"`,
    );
  }
}
