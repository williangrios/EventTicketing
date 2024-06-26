import { body } from 'express-validator'
import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { natsWrapper } from '../../nats-wrapper'

// 404 - id does not exists
// 401 - user trying to update ticket while not logged in (forbidden)
// 401 - user trying to update ticket which he is not the owner
// 400 - user does not provide title or price (invalid request)
// 201 - updated

it('returns 404 if the provided id does not exists', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .set('Cookie', global.signUp())
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(404)
})

it('returns 401 if the user is not authenticated', async () => {
  const id = new mongoose.Types.ObjectId().toHexString()
  await request(app)
    .put(`/api/tickets/${id}`)
    .send({
      title: 'new title',
      price: 20,
    })
    .expect(401)
})

it('returns 401 if the user does not own the ticket', async () => {
  const ticketCreated = await request(app)
    .post('/api/tickets')
    .set('Cookie', global.signUp()) // one userId
    .send({
      title: 'title',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${ticketCreated.body.id}`)
    .set('Cookie', global.signUp()) // OTHER userId here
    .send({
      title: 'new title',
      price: 55,
    })
    .expect(401)
})

it('returns 400 if provided invalid title or price', async () => {
  const cookie = global.signUp()
  const ticketCreated = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${ticketCreated.body.id}`)
    .set('Cookie', global.signUp()) // OTHER userId here
    .send({
      title: '',
      price: 55,
    })
    .expect(400)

  await request(app)
    .put(`/api/tickets/${ticketCreated.body.id}`)
    .set('Cookie', global.signUp()) // OTHER userId here
    .send({
      title: 'Title',
      price: -10,
    })
    .expect(400)
})

it('update the ticket with provided inputs', async () => {
  const cookie = global.signUp()
  const ticketCreated = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${ticketCreated.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(200)

  const ticketUpdated = await request(app)
    .get(`/api/tickets${ticketCreated.body.id}`)
    .send()

  expect(ticketUpdated.body.title).toEqual('New Title')
  expect(ticketUpdated.body.price).toEqual(100)
})

it('publishes an event', async () => {
  const cookie = global.signUp()
  const ticketCreated = await request(app)
    .post('/api/tickets')
    .set('Cookie', cookie)
    .send({
      title: 'title',
      price: 20,
    })
    .expect(201)

  await request(app)
    .put(`/api/tickets/${ticketCreated.body.id}`)
    .set('Cookie', cookie)
    .send({
      title: 'New Title',
      price: 100,
    })
    .expect(200)
  expect(natsWrapper.client.publish).toHaveBeenCalled()
})
