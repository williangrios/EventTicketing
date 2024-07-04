import { Message } from 'node-nats-streaming'
import { OrderCreatedEvent } from '../../../../../commom/src/events/order-created-event'
import mongoose from 'mongoose'
import { Ticket } from '../../../model/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { OrderCreatedListener } from '../order-created-listener'
import { OrderStatus } from '@wrticketing/commom-v2'

const setup = async () => {
  // create an instance of the listener
  const listener = new OrderCreatedListener(natsWrapper.client)
  // create and save an ticket
  const ticket = Ticket.build({
    title: 'Concert',
    price: 95,
    userId: '12312',
  })
  await ticket.save()
  // create the fake data event
  const data: OrderCreatedEvent['data'] = {
    id: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: '23423',
    expiresAt: '23829',
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  }
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  return { listener, ticket, data, msg }
}

it('sets the userId of the ticket', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

it('publishes a ticket updated event', async () => {
  const { listener, ticket, data, msg } = await setup()
  await listener.onMessage(data, msg)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
  const ticketUpdatedData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  )
  expect(data.id).toEqual(ticketUpdatedData.orderId)
})
