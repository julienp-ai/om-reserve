'use client'

import Image from 'next/image'
import Link from 'next/link'

interface AuthShellProps {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-center py-8 px-6 border-b border-gray-100">
        <Link href="/auth/login" className="flex items-center gap-3">
          <Image
            src="/concept-erp-logo.png"
            alt="Concept ERP"
            width={56}
            height={56}
            className="object-contain"
          />
          <div className="flex flex-col leading-none">
            <span className="text-[#0D3B5E] font-bold text-lg tracking-tight">Concept</span>
            <span className="text-[#FF4F00] font-black text-lg tracking-tight -mt-1">ERP</span>
          </div>
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-start justify-center px-5 py-10">
        <div className="w-full max-w-[420px]">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-xs text-gray-400">&copy; {new Date().getFullYear()} Concept ERP — Tous droits réservés</p>
      </footer>
    </div>
  )
}
