import { join } from 'path';
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { expand } from 'dotenv-expand';

const nodeEnv = process.env.NODE_ENV ?? 'development';
expand(config({ path: '.env.shared' }));
expand(config({ path: `.env.${nodeEnv}` }));

// Works both under ts-node (src/*.ts) and against compiled output (dist/*.js).
const ext = __filename.endsWith('.ts') ? 'ts' : 'js';

const appDataSource = new DataSource({
  type: 'postgres',
  url: process.env.POSTGRES_URL,
  entities: [join(__dirname, '..', '**', `*.entity.${ext}`)],
  migrations: [join(__dirname, '..', 'migrations', `*.${ext}`)],
  synchronize: false,
});

export default appDataSource;
