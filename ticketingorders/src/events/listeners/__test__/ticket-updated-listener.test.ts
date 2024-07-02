import { Message } from 'node-nats-streaming'
import { TicketUpdatedEvent } from '@wrticketing/commom-v2'
import mongoose from 'mongoose'
import { Ticket } from '../../../model/ticket'
import { natsWrapper } from '../../../nats-wrapper'
import { TicketUpdatedListener } from '../ticket-updated-listener'

const setup = async () => {
  // create a listener
  const listener = new TicketUpdatedListener(natsWrapper.client)
  // create and save a ticket
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'Concert',
    price: 10,
  })
  await ticket.save()
  // create a fake data object
  const data: TicketUpdatedEvent['data'] = {
    id: ticket.id,
    version: ticket.version + 1,
    title: 'Concert Night',
    price: 15,
    userId: '8902340',
  }
  // create a fake msg object
  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  }
  // return all of this stuff
  return { msg, ticket, data, listener }
}

it('finds, updates and saves a ticket', async () => {
  const { msg, data, ticket, listener } = await setup()
  await listener.onMessage(data, msg)
  const updatedTicket = await Ticket.findById(ticket.id)
  expect(updatedTicket!.title).toEqual(data.title)
  expect(updatedTicket!.price).toEqual(data.price)
  expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async () => {
  const { msg, data, ticket, listener } = await setup()
  await listener.onMessage(data, msg)
  expect(msg.ack).toHaveBeenCalled()
})

// unhappy paths
it('does not call ack if the event has a skipped version number', async () => {
  const { msg, data, ticket, listener } = await setup()
  data.version = 10
  // isso vai gerar um erro "Ticket not found"
  try {
    await listener.onMessage(data, msg)
  } catch (error) {}
  expect(msg.ack).not.toHaveBeenCalled()
})
