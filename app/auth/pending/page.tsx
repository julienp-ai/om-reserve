'use client'

import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Clock, Mail } from 'lucide-react'
import { Suspense } from 'react'

function PendingContent() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image src="/concept-erp-logo.png" alt="Concept ERP" width={56} height={56} className="object-contain" />
        </div>

        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-brand-orange/10 flex items-center justify-center">
            {isNew ? (
              <Mail className="w-8 h-8 text-brand-orange" />
            ) : (
              <Clock className="w-8 h-8 text-brand-orange" />
            )}
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-foreground mb-2">
          {isNew ? 'Compte créé avec succès !' : 'Validation en attente'}
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          {isNew
            ? "Votre demande d'accès a bien été enregistrée. Un administrateur va valider votre compte dans les plus brefs délais. Vous recevrez une notification dès l'activation."
            : "Votre compte est en cours de validation par un administrateur. Vous serez notifié dès que votre accès sera activé."}
        </p>

        <div className="flex flex-col gap-3">
          <Link href="/auth/login" className={buttonVariants({ variant: 'outline' }) + ' w-full'}>
            Retour à la connexion
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function PendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  )
}
