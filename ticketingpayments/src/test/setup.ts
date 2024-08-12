import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../app'
import jwt from 'jsonwebtoken'

// quando os testes forem executados, JEST vai ver que estamos tentando mocar o arquivo
// então, se qualquer coisa tentar importar aquele arquivo, ao invés de importar o real
// vai importar o mock
jest.mock('../nats-wrapper')

// SETANDO uma variavel de ambiente no ambiente de testes
process.env.STRIPE_KEY =
  'sk_test_51IaHZELqmC4VqoUGijoaydhF0mjBcbA9ZZHTGfpOLpclGA8JctPfQBWiJoZSFdN6lXArC4s6AebKUolLUKOEXsQw00Rtr4IPGf'

let mongo: any
// criando uma instancia do MongoDB antes dos testes
beforeAll(async () => {
  jest.clearAllMocks()
  process.env.JWT_KEY = 'private key'
  mongo = await MongoMemoryServer.create()
  const mongoUri = mongo.getUri() // pegando o URI do mongo criado
  await mongoose.connect(mongoUri, {})
})

beforeEach(async () => {
  const collections = await mongoose.connection.db.collections()
  for (let collection of collections) {
    await collection.deleteMany({})
  }
})

afterAll(async () => {
  if (mongo) {
    await mongo.stop()
  }
  await mongoose.connection.close()
})

// criando a função globalmente mas não é a melhor abordagem, melhor colocar em um arquiv e importa-la
declare global {
  var signUp: (id?: string) => string[]
}

global.signUp = (id?: string) => {
  // build a JWT payload (payload é um objeto que tem id, email )
  const payload = {
    id: id ?? new mongoose.Types.ObjectId().toHexString(),
    email: 'willian@gmail.com',
  }

  // Create the JWT (vamos usar a mesma função JWT SIgn que criamos)
  const token = jwt.sign(payload, process.env.JWT_KEY!) // variavel de ambiente foi definida no beforeAll

  // Build session object {jwt: MY_JWT}
  const session = { jwt: token }

  // Turn that session into JSON
  const sessionJSON = JSON.stringify(session)

  // Take JSON and encode it as base64
  const base64 = Buffer.from(sessionJSON).toString('base64')

  //return a string that the cookie with the encoded data
  return [`session=${base64}`]
}
