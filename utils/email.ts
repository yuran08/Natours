import nodemailer, { SendMailOptions } from 'nodemailer'

interface IOptions {
  email: string
  subject: string
  message: string
}

export const sendEmail = async (options: IOptions) => {
  const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  })

  const sendOptions: SendMailOptions = {
    from: 'Yu Ran<test.natours.io>',
    to: options.email,
    subject: options.subject,
    text: options.message,
  }

  await transport.sendMail(sendOptions)
}
