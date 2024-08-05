import { Listener, OrderCancelledEvent, Subjects } from '@wrticketing/commom-v2'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Ticket } from '../../model/ticket'
import { TicketUpdatedPublisher } from '../publishers/ticket-updated-publisher'

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled
  queueGroupName = queueGroupName
  async onMessage(
    data: OrderCancelledEvent['data'],
    message: Message
  ): Promise<void> {
    const ticket = await Ticket.findById(data.ticket.id)
    if (!ticket) throw new Error('Ticket not found')
    ticket.set({ orderId: undefined })
    await ticket.save()
    await new TicketUpdatedPublisher(this.client).publish({
      id: ticket.id,
      orderId: ticket.orderId,
      userId: ticket.userId,
      price: ticket.price,
      title: ticket.title,
      version: ticket.version,
    })
    message.ack()
  }
}
