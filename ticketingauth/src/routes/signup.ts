import jwt from 'jsonwebtoken'
import express, { Request, Response } from 'express'
import { body } from 'express-validator'

import { validateRequest } from '../middlewares/validate-request'
import { User } from '../models/user'
import { BadRequestError } from '../errors/bad-request-error'

const router = express.Router()

// colocando um middleware para validação
router.post(
  '/api/users/signup',
  [
    body('email').isEmail().withMessage('Email must be valid'),
    body('password')
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage('Password must be between 4 and 20 characters'),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      throw new BadRequestError('Email in use')
    }
    const user = User.build({
      email,
      password,
    })
    await user.save()
    // depois de salvar o usuário no DB, vamos gerar um JWT
    const userJwt = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_KEY!
    )
    // e setar na req object
    req.session = {
      jwt: userJwt,
    }

    return res.status(201).send(user)
  }
)

export { router as signUpRouter }
