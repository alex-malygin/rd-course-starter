import { MigrationInterface, QueryRunner } from "typeorm";

export class FileRecordAndUserAvatar1771496835429 implements MigrationInterface {
    name = 'FileRecordAndUserAvatar1771496835429'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."file_records_status_enum" AS ENUM('pending', 'ready')`);
        await queryRunner.query(`CREATE TYPE "public"."file_records_visibility_enum" AS ENUM('private', 'public')`);
        await queryRunner.query(`CREATE TABLE "file_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "ownerId" character varying NOT NULL, "entityId" character varying, "key" character varying NOT NULL, "contentType" character varying NOT NULL, "size" integer, "status" "public"."file_records_status_enum" NOT NULL DEFAULT 'pending', "visibility" "public"."file_records_visibility_enum" NOT NULL DEFAULT 'public', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4f36894c2e6f42a78082a933f02" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD "avatarFileId" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "avatarFileId"`);
        await queryRunner.query(`DROP TABLE "file_records"`);
        await queryRunner.query(`DROP TYPE "public"."file_records_visibility_enum"`);
        await queryRunner.query(`DROP TYPE "public"."file_records_status_enum"`);
    }

}
