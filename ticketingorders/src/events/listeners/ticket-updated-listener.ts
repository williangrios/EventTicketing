import { Message } from 'node-nats-streaming'
import { Subjects, Listener, TicketUpdatedEvent } from '@wrticketing/commom-v2'
import { Ticket } from '../../model/ticket'
import { queueGroupName } from './queue-group-name'

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
  queueGroupName = queueGroupName
  async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {
    const ticket = await Ticket.findByEvent(data)
    // se tentar atualizar com um evento de versão superior ao esperado não vai achar
    // o ticket e vai rodar este erro
    if (!ticket) {
      throw new Error('Ticket not found')
    }
    const { title, price } = data
    ticket.set({ title, price })
    await ticket.save()
    msg.ack()
  }
}
