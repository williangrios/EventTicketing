import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import { currentUserRouter } from './routes/current-user'
import { signInRouter } from './routes/signin'
import { signOutRouter } from './routes/signout'
import { signUpRouter } from './routes/signup'
import { NotFoundError, errorHandler } from '@wrticketing/commom-v2'

const app = express()

app.use(express.json())
app.set('trust proxy', true) // traffic is being proxy to our app through Ingressnginx
app.use(
  cookieSession({
    signed: false, // no encrypted
    secure: process.env.NODE_ENV !== 'test', // cookies will only be used if a user is visiting our app over HTTPS connection
  })
)

app.use(currentUserRouter)
app.use(signInRouter)
app.use(signOutRouter)
app.use(signUpRouter)
app.all('*', async () => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
