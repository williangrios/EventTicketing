import mongoose from 'mongoose'
import { Password } from '../services/password'

// An interface that describe the properties
// that are required to create a new User
interface UserAttrs {
  email: string
  password: string
}

// An interface that describes the properties
// that a User model has
interface UserModel extends mongoose.Model<UserDoc> {
  build(attrs: UserAttrs): UserDoc
}

// An interface that describes the properties
// that a User Document has
interface UserDoc extends mongoose.Document {
  email: string
  password: string
  //   createdAt: string
  //   updatedAt: string
}

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id // creating id property
        delete ret._id // removing _id property
        delete ret.password // removing password property
        delete ret.__v // removing __v property
      },
    },
  }
)

userSchema.pre('save', async function (done) {
  // it will run just if the password has been changed (update) or created (save)
  if (this.isModified('password')) {
    // 'this' means the document
    const hashed = await Password.toHash(this.get('password'))
    this.set('password', hashed)
  }
  done()
})

// custom function built into a model
userSchema.statics.build = (attrs: UserAttrs) => {
  return new User(attrs)
}

// the arguments of <> is the generics types
// it defines the types is being provided to a function as arguments
// UserDoc defines the input of the function model
// UserModel defines the output of the function model
const User = mongoose.model<UserDoc, UserModel>('User', userSchema)

export { User }
