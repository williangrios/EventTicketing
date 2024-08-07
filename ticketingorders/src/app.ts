import express from 'express'
import 'express-async-errors'
import cookieSession from 'cookie-session'

import {
  NotFoundError,
  currentUser,
  errorHandler,
} from '@wrticketing/commom-v2'
import { deleteOrderRouter } from './routes/delete'
import { indexOrderRouter } from './routes/index'
import { newOrderRouter } from './routes/new'
import { showOrderRouter } from './routes/show'

const app = express()

app.use(express.json())
app.set('trust proxy', true)
app.use(
  cookieSession({
    signed: false,
    secure: process.env.NODE_ENV !== 'test',
  })
)

app.use(currentUser)

app.use(deleteOrderRouter)
app.use(indexOrderRouter)
app.use(newOrderRouter)
app.use(showOrderRouter)

app.all('*', async () => {
  throw new NotFoundError()
})
app.use(errorHandler)

export { app }
