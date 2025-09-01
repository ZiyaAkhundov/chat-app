import type { SessionMetadata } from '@/src/shared/types/session-metadata.types'
import { Body, Head, Heading, Link, Preview, Section, Tailwind, Text } from '@react-email/components'
import { Html } from '@react-email/html'
import * as React from 'react'

interface PasswordChangeNotificationTemplateProps {
    metadata: SessionMetadata
}

export const PasswordChangeNotificationTemplate = ({ metadata}: PasswordChangeNotificationTemplateProps) => {  
    return (
        <Html>
        <Head/>
        <Preview>Password has been changed</Preview>
        <Tailwind>
            <Body className='max-w-2xl mx-auto p-6 bg-slate-50'>
                <Section className='text-center mb-8'>
                    <Heading className='text-3xl text-black font-bold'>Password has been changed</Heading>
                    <Text className='text-base text-black mt-2'>
                        You have requested a password change for your account.
                    </Text>
                </Section>

                <Section className='bg-gray-100 rounded-lg p-6 mb-6'>
                    <Heading className='text-xl font-semibold text-[#1649ff]'>
                        Information request:
                    </Heading>
                    <ul className='list-disc list-inside mt-2 text-black'>
                        <li>🌍 Location: {metadata.location.country}, {metadata.location.city}</li>
                        <li>📱 Operation system: {metadata.device.os}</li>
                        <li>🌐 Browser: {metadata.device.browser}</li>
                        <li>💻 Ip-address: {metadata.ip}</li>
                    </ul>
                    <Text className='text-gray-600 mt-2'>
                        If you did not initiate this request, please contact support.
                    </Text>
                </Section>

                <Section className='text-center mt-8'>
                    <Text className='text-gray-600'>
                    If you have any questions or encounter any difficulties, please do not hesitate to contact our support team at {''}
                        <Link href='mailto:example@gmail.com' className='text-[#1649ff] underline'>
                            {process.env.APP_NAME} support team
                        </Link>
                    </Text>
                </Section>
            </Body>
        </Tailwind>
   </Html>
  )
}