import { Message } from 'node-nats-streaming'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../../model/order'
import { Ticket } from '../../../model/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { ExpirationCompleteListener } from './../expiration-complete-listener'
import { ExpirationCompleteEvent } from '@wrticketing/commom-v2'

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client)
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 20,
  })
  await ticket.save()
  const order = Order.build({
    userId: '312321321',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  })
  await order.save()

  const data: ExpirationCompleteEvent['data'] = {
    orderId: order.id,
  }

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }

  return { listener, ticket, order, msg, data }
}

it('updates the order status to cancelled', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit an ordercancelled event', async () => {
  const { listener, order, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(eventData.id).toEqual(order.id)
})

it('ack de message', async () => {
  const { listener, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})
