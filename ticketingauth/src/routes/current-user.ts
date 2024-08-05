import { currentUser } from '@wrticketing/commom-v2'
import express from 'express'

const router = express.Router()

router.get('/api/users/currentuser', currentUser, (req, res) => {
  res.send({ currentUser: req.currentUser ?? null })
})

export { router as currentUserRouter }
