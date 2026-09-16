import { readFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { pool } from '../server/db'

for (const file of ['001_schema.sql', '002_seed.sql']) {
  const sql = await readFile(resolve('db', file), 'utf8')
  await pool.query(sql)
  console.log(`Aplicado: ${file}`)
}

await pool.end()
