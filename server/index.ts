import { createApp } from './app'
import express from 'express'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { config } from './config'
import { pool } from './db'
import { PgRepository } from './pg-repository'

const app = createApp(new PgRepository(pool))
const dist = resolve('dist')
if (existsSync(dist)) {
  app.use(express.static(dist))
  app.get('/{*path}', (_request, response) => response.sendFile(resolve(dist, 'index.html')))
}
const server = app.listen(config.port, '127.0.0.1', () => {
  console.log(`API do É o Tutoras: http://127.0.0.1:${config.port}`)
})

const shutdown = () => server.close(() => pool.end().finally(() => process.exit(0)))
process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
