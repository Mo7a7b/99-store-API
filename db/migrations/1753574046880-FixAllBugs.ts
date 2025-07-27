import { MigrationInterface, QueryRunner } from "typeorm";

export class FixAllBugs1753574046880 implements MigrationInterface {
    name = 'FixAllBugs1753574046880'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "payments" ADD "deliveryPrice" numeric(10,2) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryPrice"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryPrice" numeric(10,2) NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "deliveryPrice"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "deliveryPrice" integer`);
        await queryRunner.query(`ALTER TABLE "payments" DROP COLUMN "deliveryPrice"`);
    }

}
