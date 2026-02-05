import * as path from 'node:path';
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

dotenv.config();

// test deploy
const migrationPrefix = path.join(__dirname, '..');

export class CustomDataSource extends DataSource {
  async runMigrations(migrations: any): Promise<any> {
    // what we do here is to lock the migrations table with a lock that is held for the duration of the migration
    const lockId = createMigrationLockId();
    await this.query(`SELECT pg_advisory_lock(${lockId});`);
    // if pg_advisory_lock(1) returns 0, it means that another instance of the app is already running migrations
    // so we should not run migrations again
    // this is a workaround for the fact that typeorm does not support migrations locking
    // what will happen is that the first instance of the app will run the migrations and the second instance will not run them and will just continue
    // this is not ideal, but it's better than running the migrations twice
    const result = await super.runMigrations(migrations);
    await this.query(`SELECT pg_advisory_unlock(${lockId});`);

    return result;
  }
}

const OrmConfig = new CustomDataSource({
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(<string>process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: [migrationPrefix + '/src/**/*.entity.{ts,js}'],
  synchronize: false,
  migrationsTableName: 'typeorm_meta',
  migrations: [migrationPrefix + '/migrations/*.{ts,js}'],
  namingStrategy: new SnakeNamingStrategy(),
});
export default OrmConfig;

function createMigrationLockId() {
  const lock = Buffer.alloc(32, 0);
  Buffer.from('rd-course-starter').copy(lock);
  return lock.readUInt32BE();
}
