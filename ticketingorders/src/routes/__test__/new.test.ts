import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order, OrderStatus } from '../../model/order'
import { Ticket } from '../../model/ticket'
import { natsWrapper } from '../../nats-wrapper'

it('returns an error if the ticket does not exists', async () => {
  const ticketId = new mongoose.Types.ObjectId()
  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signUp())
    .send({
      ticketId,
    })
    .expect(404)
})

it('returns an error if the ticket is already reserved', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 80,
  })
  await ticket.save()
  const order = Order.build({
    userId: '12321321',
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  })
  await order.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signUp())
    .send({
      ticketId: ticket.id,
    })
    .expect(400)
})

it('reserve a ticket', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 80,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signUp())
    .send({ ticketId: ticket.id })
    .expect(201)
})

it('emits an order created event', async () => {
  const ticket = Ticket.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    title: 'concert',
    price: 80,
  })
  await ticket.save()

  await request(app)
    .post('/api/orders')
    .set('Cookie', global.signUp())
    .send({ ticketId: ticket.id })
    .expect(201)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
