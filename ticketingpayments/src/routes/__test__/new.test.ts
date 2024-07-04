import request from 'supertest'
import { app } from '../../app'
import mongoose from 'mongoose'
import { Order } from '../../models/Order'
import { OrderStatus } from '@wrticketing/commom-v2'
import { stripe } from '../../stripe'
import { Payment } from '../../models/Payments'

it('throw error 404 when purchasing an order that does not exist', async () => {
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signUp())
    .send({
      token: '2349238',
      orderId: new mongoose.Types.ObjectId().toHexString(),
    })
    .expect(404)
})

it('return a 401 error when purchasing an order that doestnot belong to the user', async () => {
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: new mongoose.Types.ObjectId().toHexString(),
    version: 0,
    price: 15,
    status: OrderStatus.Created,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signUp())
    .send({
      token: '2349238',
      orderId: order.id,
    })
    .expect(401)
})

it('return a 400 error when purchasing a cancelled order', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 1,
    price: 15,
    status: OrderStatus.Cancelled,
  })
  await order.save()

  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signUp(userId))
    .send({
      token: '2349238',
      orderId: order.id,
    })
    .expect(400)
})

// estamos dizendo ao jest para usar o mock file ao inves do real stripe
// Outra explicação: quando importamos o stripe correto (../../stripe)
// o jest vai buscar o que está dentro da pasta __mock__
// comentei pois vou usar outra abordagem no teste
// jest.mock('../../stripe')

it('returns a 204 with valid inputs', async () => {
  const userId = new mongoose.Types.ObjectId().toHexString()
  const price = Math.floor(Math.random() * 100000)
  const order = Order.build({
    id: new mongoose.Types.ObjectId().toHexString(),
    userId: userId,
    version: 1,
    price,
    status: OrderStatus.Created,
  })
  await order.save()
  await request(app)
    .post('/api/payments')
    .set('Cookie', global.signUp(userId))
    .send({
      token: 'tok_visa',
      orderId: order.id,
    })
    .expect(201)

  // vamos buscar na stripe api as 10 ultimas charge e achar a nossa
  const stripeCharges = await stripe.charges.list({ limit: 50 })
  const stripeCharge = stripeCharges.data.find((charge) => {
    return charge.amount === price * 100
  })
  expect(stripeCharge).toBeDefined()
  expect(stripeCharge!.currency).toEqual('usd')

  const payment = await Payment.findOne({
    orderId: order.id,
    stripeId: stripeCharge!.id,
  })
  expect(payment).not.toBeNull()
})
