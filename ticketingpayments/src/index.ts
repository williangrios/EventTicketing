import mongoose from 'mongoose'
import { app } from './app'
import { natsWrapper } from './nats-wrapper'
import { OrderCancelledListener } from './events/listeners/order-cancelled-listener'
import { OrderCreatedListener } from './events/listeners/order-created-listener'

const start = async () => {
  // if (!process.env.JWT_KEY) {
  //   throw new Error('JWT_KEY must be defined')
  // }

  if (!process.env.MONGO_URI) {
    throw new Error('MONGO_URI must be defined')
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS_CLIENT_ID must be defined')
  }

  if (!process.env.NATS_URL) {
    throw new Error('NATS_URL must be defined')
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS_CLUSTER_ID must be defined')
  }

  try {
    // o primeiro parametro é o -cid dentro de nats-depl.yaml
    // --- é o clusterId que estamos tentando conectar
    // o segundo argumento é uma string aleatória
    // o terceiro argumento é a porta especificada em nats-depl.yaml
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID, // nats cluster id
      process.env.NATS_CLIENT_ID, // nats client id
      process.env.NATS_URL // nats url
    )

    // após conectar, vamos certificar que após um close event, finalizar um processo
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed')
      process.exit()
    })
    // também adicionamos dois listeners para certificar que mesmo que interrompa ou termine
    // também vamos dar um close em tudo
    process.on('SIGINT', () => natsWrapper.client.close())
    process.on('SIGTERM', () => natsWrapper.client.close())

    new OrderCreatedListener(natsWrapper.client).listen()
    new OrderCancelledListener(natsWrapper.client).listen()

    await mongoose.connect(process.env.MONGO_URI)
    console.log('connected to mongodb')
  } catch (error) {
    console.error(error)
  }
  const PORT = 3000
  app.listen(PORT, () => {
    console.log('TICKETS SERVICE LISTENING ON PORT-- ', PORT)
  })
}

start()
