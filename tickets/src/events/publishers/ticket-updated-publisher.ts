import { Publisher, Subjects, TicketUpdatedEvent } from '@wrticketing/commom-v2'

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated
}
