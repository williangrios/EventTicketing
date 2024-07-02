import { Publisher, Subjects, OrderCancelledEvent } from '@wrticketing/commom-v2'

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled
}