import request from 'supertest'
import { Order, OrderStatus } from '../../model/order'
import { Ticket } from '../../model/ticket'
import { app } from '../../app'
import { natsWrapper } from '../../nats-wrapper'

test('marks an order as cancelled', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 15,
  })
  await ticket.save()

  const user = global.signUp()
  // create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // make a requeest to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204)

  // make sure the order is cancelled
  const updatedOrder = await Order.findById(order.id)
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emits an order cancelled event', async () => {
  // create a ticket
  const ticket = Ticket.build({
    title: 'concert',
    price: 15,
  })
  await ticket.save()

  const user = global.signUp()
  // create an order
  const { body: order } = await request(app)
    .post('/api/orders')
    .set('Cookie', user)
    .send({ ticketId: ticket.id })
    .expect(201)

  // make a requeest to cancel the order
  await request(app)
    .delete(`/api/orders/${order.id}`)
    .set('Cookie', user)
    .expect(204)

  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
