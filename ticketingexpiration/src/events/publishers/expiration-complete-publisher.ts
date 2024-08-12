import {
  Subjects,
  Publisher,
  ExpirationCompleteEvent,
} from '@wrticketing/commom-v2'

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete
}
