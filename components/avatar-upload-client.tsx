'use client'

import { useRouter } from 'next/navigation'
import { AvatarUpload } from './avatar-upload'

interface Props {
  userId: string
  avatarUrl: string | null
  fullName: string
}

export function AvatarUploadClient({ userId, avatarUrl, fullName }: Props) {
  const router = useRouter()
  return (
    <AvatarUpload
      userId={userId}
      avatarUrl={avatarUrl}
      fullName={fullName}
      onUpload={() => router.refresh()}
    />
  )
}
