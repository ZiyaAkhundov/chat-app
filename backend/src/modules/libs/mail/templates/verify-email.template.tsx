import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'

interface verificationTemplateProps{
    domain: string
    token: string
}

export const verifyEmailTemplate = ({domain, token}: verificationTemplateProps) => {
    const verificationLink = `${domain}/account/verify?token=${token}`
    return (
     <Html>
          <Head/>
          <Preview>Account verification</Preview>
          <Tailwind>
              <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
                  <Section className='text-center mb-8'>
                      <Heading className='text-3xl text-black font-bold'>Confirming your email</Heading>
                      <Text className='text-base text-black'>
                          Thank you for registering with ZeoChat! To confirm your email address, please follow this link:
                      </Text>
                      <Link href={verificationLink} className='inline-flex justify-center items-center rounded-full text-sm font-medium text-white bg-[#1649ff] px-5 py-2'>
                          Confirm email
                      </Link>
                  </Section>

                  <Section className='text-center mt-8'>
                      <Text className='text-gray-600'>
                      If you have any questions or encounter any difficulties, please do not hesitate to contact our support team at {''}
                          <Link href='mailto:example@gmail.com' className='text-[#1649ff] underline'>
                              {process.env.SUPPORT_TEAM} support team
                          </Link>
                      </Text>
                  </Section>
              </Body>
          </Tailwind>
     </Html>
    )
}
