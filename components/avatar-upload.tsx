'use client'

import { useRef, useState } from 'react'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import { Camera, Loader2 } from 'lucide-react'

interface AvatarUploadProps {
  userId: string
  avatarUrl: string | null
  fullName: string
  onUpload: (url: string) => void
}

export function AvatarUpload({ userId, avatarUrl, fullName, onUpload }: AvatarUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [preview, setPreview] = useState<string | null>(avatarUrl)

  const initials = fullName
    .split(' ')
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase()

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setError('La photo ne doit pas dépasser 5 Mo.')
      return
    }

    setError('')
    setUploading(true)

    // Local preview
    const objectUrl = URL.createObjectURL(file)
    setPreview(objectUrl)

    const supabase = createClient()
    const ext = file.name.split('.').pop()
    const path = `${userId}/avatar.${ext}`

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true })

    if (uploadError) {
      setError("Erreur lors de l'envoi de la photo.")
      setPreview(avatarUrl)
      setUploading(false)
      return
    }

    const { data } = supabase.storage.from('avatars').getPublicUrl(path)
    const publicUrl = `${data.publicUrl}?t=${Date.now()}`

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ avatar_url: publicUrl })
      .eq('id', userId)

    setUploading(false)

    if (updateError) {
      setError('Photo envoyée mais profil non mis à jour.')
    } else {
      setPreview(publicUrl)
      onUpload(publicUrl)
      window.dispatchEvent(new CustomEvent('avatar-updated', { detail: { url: publicUrl } }))
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="relative group w-24 h-24 rounded-full overflow-hidden border-2 border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-label="Changer la photo de profil"
      >
        {preview ? (
          <Image
            src={preview}
            alt={fullName}
            fill
            className="object-cover"
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-om-blue text-om-blue-foreground text-2xl font-semibold">
            {initials}
          </div>
        )}

        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploading ? (
            <Loader2 className="w-5 h-5 text-white animate-spin" />
          ) : (
            <Camera className="w-5 h-5 text-white" />
          )}
        </div>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        aria-label="Sélectionner une photo de profil"
      />

      <p className="text-xs text-muted-foreground">
        {uploading ? 'Envoi en cours...' : 'Cliquer pour changer la photo'}
      </p>

      {error && (
        <p className="text-xs text-destructive">{error}</p>
      )}
    </div>
  )
}
