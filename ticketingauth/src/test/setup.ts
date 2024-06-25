import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import request from 'supertest'
import { app } from '../app'

let mongo: any
// criando uma instancia do MongoDB antes dos testes
beforeAll(async () => {
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
  var signUp: () => Promise<string[]>
}

global.signUp = async () => {
  const email = 'willian@gmail.com'
  const password = 'password'
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email,
      password,
    })
    .expect(201)
  const cookie = response.get('Set-Cookie') as string[]
  return cookie
}
