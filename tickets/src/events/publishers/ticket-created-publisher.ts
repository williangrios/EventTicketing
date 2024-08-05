import { Publisher, Subjects, TicketCreatedEvent } from '@wrticketing/commom-v2'

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated
}
