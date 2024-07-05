import { currentUser } from './../../../../commom/src/middlewares/current-user'
import request from 'supertest'
import { app } from '../../app'

it('should respond with details about the current user', async () => {
  const cookie = await signUp()
  const responseCurrentUser = await request(app)
    .get('/api/users/currentuser')
    // setando o cookie aqui
    .set('Cookie', cookie)
    .send()
    .expect(200)
  // verificando se esta ok
  expect(responseCurrentUser.body.currentUser.email).toEqual(
    'willian@gmail.com'
  )
})

it('responds with null if not authenticated', async () => {
  const responseCurrentUser = await request(app)
    .get('/api/users/currentuser')
    // note que não estou enviando cookie aqui pois não esta autenticado
    .send()
    .expect(200)
  expect(responseCurrentUser.body.currentUser).toEqual(null)
})
