import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost', //process.env.DB_HOST || 
  port: 5432, //parseInt(process.env.DB_PORT, 10) || 5432,
  username: 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: 'crm_db',
  entities: [__dirname + '/../modules/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
  logging: false,
});
