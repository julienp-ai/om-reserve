import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'
import { AuthShell } from '@/components/auth/auth-shell'

export default function AuthErrorPage() {
  return (
    <AuthShell>
      <div className="flex flex-col items-center text-center py-4 space-y-6">
        {/* Icone */}
        <div className="w-20 h-20 rounded-full bg-red-50 flex items-center justify-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        {/* Texte */}
        <div className="space-y-3">
          <div className="w-10 h-[3px] bg-[#FF4F00] rounded-full mx-auto" />
          <h1 className="text-[#0D3B5E] text-2xl font-bold tracking-tight">
            Erreur d&apos;authentification
          </h1>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm mx-auto">
            Une erreur est survenue lors de la connexion. Le lien a peut-être expiré ou est invalide.
          </p>
        </div>

        {/* CTA */}
        <Link
          href="/auth/login"
          className={buttonVariants() + ' h-13 px-8 bg-[#FF4F00] hover:bg-[#e64400] text-white font-bold rounded-xl text-base transition-all'}
        >
          Retour à la connexion
        </Link>
      </div>
    </AuthShell>
  )
}
