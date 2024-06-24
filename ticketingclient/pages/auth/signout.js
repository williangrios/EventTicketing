import React from 'react'
import { useEffect } from 'react'
import Router from 'next/router'
import useRequest from '../../hooks/use-request'

function Signout() {
  const { doRequest } = useRequest({
    url: '/api/users/signout',
    body: {},
    method: 'post',
    onSuccess: () => {
      Router.push('/')
    },
  })

  useEffect(() => {
    doRequest()
  }, [])

  return <div>Signing you out....</div>
}

export default Signout
