import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketCreatedEvent } from '@wrticketing/commom-v2'
import { Ticket } from '../../model/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
  queueGroupName = queueGroupName
  async onMessage(data: TicketCreatedEvent['data'], msg: Message) {
    // salvando dados do ticket no banco de dados deste serviço
    const { id, title, price } = data
    const ticket = Ticket.build({
      id,
      title,
      price,
    })
    await ticket.save()
    msg.ack()
  }
}
