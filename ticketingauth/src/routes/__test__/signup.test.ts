import request from 'supertest'
import { app } from '../../app'

it('returns a 201 on successful signup', async () => {
  return request(app)
    .post('/api/users/signup') // route
    .send({
      // informações no body
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(201)
})

it('returns a 400 status with invalid email', () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian',
      password: 'password',
    })
    .expect(400)
})

it('returns a 400 status with invalid password', () => {
  return request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: '1',
    })
    .expect(400)
})

it('returns a 400 status with missing email and password', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: '',
      password: 'password',
    })
    .expect(400)

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: '',
    })
    .expect(400)
})

it('disallows sign up twice', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(201)

  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(400)
})

it('sets a cookie after successfull sign up', async () => {
  const response = await request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(201)
  // vamos inspecionar o header
  // o metodo get nos permite ver os headers que tem dentro de response
  // o header que estamos tentando olhar é o Set-Cookie
  // de inicio este teste dará erro pois no nosso app.ts setamos a configuração abaixo
  //   -----
  //   app.use(
  //     cookieSession({
  //       signed: false, // no encrypted
  //       secure: true, // cookies will only be used if a user is visiting our app over HTTPS connection
  //     })
  //   )
  //   -----
  // e no ambiente de testes fazemos conexão HTTP
  // por isso precisamos alterar secure: false em ambiente de testes (alterei para a linha abaixo)
  //   secure: process.env.NODE_ENV !== 'test',
  expect(response.get('Set-Cookie')).toBeDefined()
})
