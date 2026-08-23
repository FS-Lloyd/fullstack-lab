import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddParentTaskIdAndTaskCount1787137469292 implements MigrationInterface {
  name = 'AddParentTaskIdAndTaskCount1787137469292';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "task" ADD "parentTaskId" integer`);
    await queryRunner.query(
      `ALTER TABLE "user" ADD "taskCount" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(
      `ALTER TABLE "task" ADD CONSTRAINT "FK_8bf6d736c49d48d91691ea0dfe5" FOREIGN KEY ("parentTaskId") REFERENCES "task"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "task" DROP CONSTRAINT "FK_8bf6d736c49d48d91691ea0dfe5"`,
    );
    await queryRunner.query(`ALTER TABLE "user" DROP COLUMN "taskCount"`);
    await queryRunner.query(`ALTER TABLE "task" DROP COLUMN "parentTaskId"`);
  }
}
