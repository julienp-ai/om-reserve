import Image from 'next/image'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md text-center">
        <div className="flex justify-center mb-6">
          <Image src="/concept-erp-logo.png" alt="Concept ERP" width={56} height={56} className="object-contain" />
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
        </div>
        <h1 className="text-2xl font-semibold text-foreground mb-2">Erreur d&apos;authentification</h1>
        <p className="text-muted-foreground leading-relaxed mb-6">
          Une erreur est survenue lors de la connexion. Le lien a peut-être expiré.
        </p>
        <Link href="/auth/login" className={buttonVariants() + ' bg-om-blue text-om-blue-foreground hover:bg-om-blue/90'}>
          Retour à la connexion
        </Link>
      </div>
    </div>
  )
}
