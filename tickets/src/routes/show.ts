import express, { Request, Response } from 'express'
import { Ticket } from '../model/ticket'
import { NotFoundError } from '@wrticketing/commom-v2'

const router = express.Router()

router.get('/api/tickets/:id', async (req: Request, res: Response) => {
  const ticket = await Ticket.findById(req.params.id)
  if (!ticket) {
    throw new NotFoundError()
  }
  res.send(ticket)
})

export { router as showTicketRouter }
