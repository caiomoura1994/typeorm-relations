import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from "typeorm";

export class AddCustomerIdToOrders1669588830357 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.addColumn(
            'orders',
            new TableColumn({
                name: 'customer_id',
                type: 'uuid',
                isNullable: true
            })
        )
        await queryRunner.createForeignKey(
            'orders',
            new TableForeignKey({
                name: 'OrdesCustomer',
                columnNames: ['customer_id'],
                referencedColumnNames: ['id'],
                referencedTableName: 'customers',
                onDelete: 'SET NULL'
            })
        )
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropForeignKey('orders', 'OrdesCustomer')
        await queryRunner.dropColumn('orders', 'customer_id')
    }

}
