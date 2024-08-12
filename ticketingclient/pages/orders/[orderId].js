import React from 'react'
import { useEffect, useState } from 'react'
import StripeCheckout from 'react-stripe-checkout'
import useRequest from '../../hooks/use-request'
import Router from 'next/router'

function OrderShow({ order, currentUser }) {
  const [timeLeft, setTimeLeft] = useState(0)
  const { doRequest, errors } = useRequest({
    url: '/api/payments',
    method: 'post',
    body: {
      orderId: order.id,
    },
    onSuccess: (payment) => {
      Router.push('/orders')
    },
  })
  useEffect(() => {
    const findTimeLeft = () => {
      const msLeft = new Date(order.expiresAt) - new Date()
      setTimeLeft(Math.round(msLeft / 1000))
    }
    findTimeLeft()
    const timerId = setInterval(findTimeLeft, 1000)
    return () => {
      // isso vai impedir que ele rode eternamente após sair da página
      clearInterval(timerId)
    }
  }, [])

  if (timeLeft < 0) {
    return <div>Order expired</div>
  }
  return (
    <div>
      Time left to pay: {timeLeft} seconds
      <StripeCheckout
        token={({ id }) => {
          // callback, aqui vamos fazer a requisição ao backend com o token incluido
          doRequest({ token: id })
        }}
        stripeKey="pk_test_51IaHZELqmC4VqoUGLThF8fKRzvGUzRBkogADlu5ssxSNyTX3AFEDokhco5KBb5tGUKWV6FdA27PqGphyM2k3ifOU001jF8eg0e"
        amount={order.ticket.price * 100}
        email={currentUser.email}
      />
      {errors}
    </div>
  )
}

OrderShow.getInitialProps = async (context, client) => {
  const { orderId } = context.query
  const { data } = await client.get(`/api/orders/${orderId}`)
  return { order: data }
}

export default OrderShow
