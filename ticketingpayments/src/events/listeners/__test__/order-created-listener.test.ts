import { OrderCreatedEvent, OrderStatus } from '@wrticketing/commom-v2'
import { Order } from '../../../models/Order'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import mongoose from 'mongoose'
import { Message } from 'node-nats-streaming'

const setup = async () => {
  const listener = new OrderCreatedListener(natsWrapper.client)

  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    expiresAt: '908908',
    userId: '2308943',
    status: OrderStatus.Created,
    ticket: {
      id: '293874',
      price: 23,
    },
  }

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, data, msg }
}

it('replicates the order info', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const order = await Order.findById(data.id)
  expect(order!.price).toEqual(data.ticket.price)
})

it('acks the message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
