import 'dotenv/config'

export const config = {
  databaseUrl: process.env.DATABASE_URL ?? 'postgresql://tutoras:tutoras@127.0.0.1:55432/tutoras',
  port: Number(process.env.PORT ?? 3338),
}
