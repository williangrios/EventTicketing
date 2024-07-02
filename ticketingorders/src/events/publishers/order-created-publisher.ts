import { Publisher, OrderCreatedEvent, Subjects } from '@wrticketing/commom-v2'

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
}
