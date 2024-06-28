import { requireAuth, validateRequest } from '@wrticketing/commom-v2'
import { body } from 'express-validator'
import express, { Response, Request } from 'express'
import { Ticket } from '../model/ticket'
import { TicketCreatedPublisher } from '../events/publishers/ticket-created-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.post(
  '/api/tickets',
  requireAuth,
  [body('title').not().isEmpty().withMessage('Title is required')],
  [
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body
    const ticket = Ticket.build({
      title,
      price,
      userId: req.currentUser!.id,
    })
    await ticket.save()
    // publish event
    new TicketCreatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      ...ticket,
    })
    res.status(201).send(ticket)
  }
)

export { router as createTicketRouter }
