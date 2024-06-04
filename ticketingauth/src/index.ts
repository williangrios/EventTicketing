import express from 'express'
import { json } from 'body-parser'

const app = express()
app.use(json())

app.get('/api/users/currentuser', (req, res) => {
  res.send('hi there')
})

const PORT = 3000
app.listen(PORT, () => {
  console.log('TICKETING AUTH SERVICE LISTENING ON PORT ', PORT)
})
