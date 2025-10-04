import 'dotenv/config'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json({ limit: '25mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

const port = process.env.PORT || 5050
app.listen(port, () => {
  console.log(`Server running on :${port}`)
})
