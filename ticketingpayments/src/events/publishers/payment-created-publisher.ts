import {
  Subjects,
  Publisher,
  PaymentCreatedEvent,
} from '@wrticketing/commom-v2'

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
}
