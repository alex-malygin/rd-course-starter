import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateProcessedMessagesTable1772528105175 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: "processed_messages",
                columns: [
                    {
                        name: "message_id",
                        type: "uuid",
                        isPrimary: true,
                    },
                    {
                        name: "order_id",
                        type: "uuid",
                    },
                    {
                        name: "handler",
                        type: "varchar",
                        isNullable: true,
                    },
                    {
                        name: "processed_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("processed_messages");
    }

}
