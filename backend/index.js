// backend/index.js
// created to test if backend works fine
// !! run from the backend folder !!
// run with `node index.js` or `npm start` or `npm run dev` after setting up .env file

require('dotenv').config();
const express = require('express');
const cors = require('cors');

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
