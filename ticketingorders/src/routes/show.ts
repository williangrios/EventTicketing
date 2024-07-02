import express, { Request, Response } from 'express'
import { Order } from '../model/order'
import {
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
} from '@wrticketing/commom-v2'

const router = express.Router()

router.get(
  '/api/orders/:orderId',
  requireAuth,
  async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.orderId).populate('ticket')
    if (!order) throw new NotFoundError()
    if (order.userId !== req.currentUser!.id) throw new NotAuthorizedError()
    res.send(order)
  }
)

export { router as showOrderRouter }
