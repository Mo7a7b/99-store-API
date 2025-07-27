import { MigrationInterface, QueryRunner } from "typeorm";

export class FixBug1753626751078 implements MigrationInterface {
    name = 'FixBug1753626751078'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_846bba7699165f3da22d7de2ef8"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "paymentIdId" TO "paymentId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_06a051324c76276ca2a9d1feb08" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_06a051324c76276ca2a9d1feb08"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "paymentId" TO "paymentIdId"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_846bba7699165f3da22d7de2ef8" FOREIGN KEY ("paymentIdId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
