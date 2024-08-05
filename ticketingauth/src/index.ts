import mongoose from 'mongoose'
import { app } from './app'

const start = async () => {
  // if (!process.env.JWT_KEY) {
  //   throw new Error('JWT_KEY must be defined')
  // }
  console.log('Starting up...')
  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }

  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log('connected to mongodb')
  } catch (error) {
    console.error(error)
  }
  const PORT = 3000
  app.listen(PORT, () => {
    console.log('TICKETING AUTH SERVICE LISTENING ON PORT-- ', PORT)
  })
}

start()
