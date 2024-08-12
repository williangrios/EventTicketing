import { Listener, OrderCreatedEvent, Subjects } from '@wrticketing/commom-v2'
import { queueGroupName } from './queue-group-name'
import { Message } from 'node-nats-streaming'
import { expirationQueue } from '../../queues/expiration-queue'

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated
  queueGroupName = queueGroupName
  async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
    // gettime retorna o time em miliseconds
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
    await expirationQueue.add(
      {
        orderId: data.id,
      },
      {
        // colocamos este objeto como segundo argumento de add contendo o delay
        delay,
      }
    )
    msg.ack()
  }
}
