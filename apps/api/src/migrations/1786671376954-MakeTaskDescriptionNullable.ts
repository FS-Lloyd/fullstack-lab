import { MigrationInterface, QueryRunner } from 'typeorm';

export class MakeTaskDescriptionNullable1786671376954 implements MigrationInterface {
  name = 'MakeTaskDescriptionNullable1786671376954';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "description" DROP NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" ALTER COLUMN "description" SET NOT NULL`,
    );
  }
}
