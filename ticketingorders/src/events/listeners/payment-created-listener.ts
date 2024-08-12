import {
  Subjects,
  Listener,
  PaymentCreatedEvent,
  OrderStatus,
} from '@wrticketing/commom-v2'
import { Message } from 'node-nats-streaming'
import { queueGroupName } from './queue-group-name'
import { Order } from '../../model/order'

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  subject: Subjects.PaymentCreated = Subjects.PaymentCreated
  queueGroupName = queueGroupName
  async onMessage(data: PaymentCreatedEvent['data'], msg: Message) {
    const order = await Order.findById(data.orderId)
    if (!order) throw new Error('Order not found')
    order.set({
      status: OrderStatus.Complete,
    })
    await order.save()
    msg.ack()
  }
}
