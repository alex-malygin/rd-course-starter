import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1738755600000 implements MigrationInterface {
    name = 'InitialSchema1738755600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "email" character varying(255) NOT NULL, "password" character varying(255) NOT NULL, "first_name" character varying(255), "last_name" character varying(255), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672df88af878c0f47b1745998" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "name" character varying NOT NULL, "description" text, "price" numeric(10,2) NOT NULL, "stock" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_08aed659e6134f313142850f307" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "idempotency_key" uuid NOT NULL, "user_id" uuid NOT NULL, "total_amount" numeric(10,2) NOT NULL DEFAULT '0', "status" character varying(50) NOT NULL DEFAULT 'PENDING', "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6d9e03a98e8206d20f666c5d98d" UNIQUE ("idempotency_key"), CONSTRAINT "PK_710e2d4957aa5878ebb94459c9a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "quantity" integer NOT NULL DEFAULT '1', "price" numeric(10,2) NOT NULL, CONSTRAINT "PK_0052efcf0835c44190da243003b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_a922712166a4697d0577b897911" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_158f0a5394747796d13c7936a7a" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_9307761ef2f218763590299f0b1" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        
        // Add optimization index
        await queryRunner.query(`CREATE INDEX "idx_orders_user_created" ON "orders" ("user_id", "created_at") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "idx_orders_user_created"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_9307761ef2f218763590299f0b1"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_158f0a5394747796d13c7936a7a"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_a922712166a4697d0577b897911"`);
        await queryRunner.query(`DROP TABLE "order_items"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TABLE "products"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
