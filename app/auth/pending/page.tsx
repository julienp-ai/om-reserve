'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { Clock, Mail } from 'lucide-react'
import { Suspense } from 'react'
import { AuthShell } from '@/components/auth/auth-shell'

function PendingContent() {
  const searchParams = useSearchParams()
  const isNew = searchParams.get('new') === '1'

  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center py-4 space-y-6">
        {/* Icone */}
        <div className="w-20 h-20 rounded-full bg-[#FF4F00]/10 flex items-center justify-center">
          {isNew
            ? <Mail className="w-10 h-10 text-[#FF4F00]" />
            : <Clock className="w-10 h-10 text-[#FF4F00]" />
          }
        </div>

        {/* Texte */}
        <div className="space-y-3">
          <div className="w-10 h-[3px] bg-[#FF4F00] rounded-full mx-auto" />
          <h1 className="text-[#0D3B5E] text-2xl font-bold tracking-tight">
            {isNew ? 'Demande envoyée !' : 'Validation en attente'}
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
            {isNew
              ? "Votre demande d'accès a bien été enregistrée. Un administrateur va valider votre compte dans les plus brefs délais."
              : "Votre compte est en cours de validation par un administrateur. Vous serez notifié dès que votre accès sera activé."
            }
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/auth/login"
          className={buttonVariants({ variant: 'outline' }) + ' rounded-xl h-12 px-8 text-[#0D3B5E] border-gray-200 hover:border-[#0D3B5E] font-semibold transition-colors'}
        >
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  )
}

export default function PendingPage() {
  return (
    <Suspense>
      <PendingContent />
    </Suspense>
  )
}
