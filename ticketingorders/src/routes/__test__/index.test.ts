import request from 'supertest'
import { app } from '../../app'
import { Order } from '../../model/order'
import { Ticket } from '../../model/ticket'

const buildTickets = async () => {
  const ticket1 = Ticket.build({
    title: 'concert',
    price: 80,
  })
  await ticket1.save()

  const ticket2 = Ticket.build({
    title: 'Match',
    price: 35,
  })
  await ticket2.save()

  const ticket3 = Ticket.build({
    title: 'SHOW',
    price: 40,
  })
  await ticket3.save()
  return { ticket1, ticket2, ticket3 }
}

it('fetches orders for an particular user', async () => {
  // create three tickets
  const { ticket1, ticket2, ticket3 } = await buildTickets()
  // create users
  const user1 = global.signUp()
  const user2 = global.signUp()
  // create one order as #User1
  await request(app)
    .post('/api/orders')
    .set('Cookie', user1)
    .send({ ticketId: ticket1.id })
    .expect(201)

  // -------User 2
  // create two order as #User2
  const { body: Order1 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket2.id })
    .expect(201)

  const { body: Order2 } = await request(app)
    .post('/api/orders')
    .set('Cookie', user2)
    .send({ ticketId: ticket3.id })
    .expect(201)

  // Make Request to get orders for #User2
  const response = await request(app).get('/api/orders').set('Cookie', user2)

  // Make sure we only got the orders for #User2
  expect(response.body.length).toEqual(2)
  expect(response.body[0].id).toEqual(Order1.id)
  expect(response.body[1].id).toEqual(Order2.id)
})
