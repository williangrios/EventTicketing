import request from 'supertest'
import { app } from '../../app'

it('should not sign in', async () => {
  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'notexists@gmail.com',
      password: 'password',
    })
    .expect(400)
})

it('should fail when an incorrect password is supplied', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(201)

  await request(app).post('/api/users/signout').send({}).expect(200)

  return request(app)
    .post('/api/users/signin')
    .send({
      email: 'willian@gmail.com',
      password: 'incorrect',
    })
    .expect(400)
})

it('should sign in and set cookie', async () => {
  await request(app)
    .post('/api/users/signup')
    .send({
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(201)

  await request(app).post('/api/users/signout').send({}).expect(200)

  const response = await request(app)
    .post('/api/users/signin')
    .send({
      email: 'willian@gmail.com',
      password: 'password',
    })
    .expect(200)
  expect(response.get('Set-Cookie')).toBeDefined()
})
