import express, { Request, Response } from 'express'
import { body } from 'express-validator'
import {
  validateRequest,
  NotFoundError,
  requireAuth,
  NotAuthorizedError,
} from '@wrticketing/commom-v2'
import { Ticket } from '../model/ticket'
import { TicketUpdatedPublisher } from '../events/publishers/ticket-updated-publisher'
import { natsWrapper } from '../nats-wrapper'

const router = express.Router()

router.put(
  '/api/tickets/:id',
  requireAuth,
  [
    body('title').not().isEmpty().withMessage('Title is required'),
    body('price')
      .isFloat({ gt: 0 })
      .withMessage('Price must be provided and must be greater than 0'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const ticket = await Ticket.findById(req.params.id)
    if (!ticket) {
      throw new NotFoundError()
    }
    if (ticket.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError()
    }
    ticket.set({
      title: req.body.title,
      price: req.body.price,
    })
    // interessante que isso irá salvar e rodar todos os hooks pre-save e pós-save
    // do model. então ticket será uma versão atualizada de tudo e não precisamos buscá-la
    // novamente no banco de dados
    await ticket.save()
    // emitindo o evento
    new TicketUpdatedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    })
    res.send(ticket)
  }
)

export { router as updateTicketRouter }
