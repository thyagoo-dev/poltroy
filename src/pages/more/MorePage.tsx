import { ChevronRight, DatabaseBackup, Info, Settings, Smartphone } from 'lucide-react'
import { Link } from 'react-router'

import { MorePageHeader } from '@/pages/more/MorePageHeader'
import { Card } from '@/shared/ui/Card'

const sections = [
  { path: '/more/app', title: 'Aplicativo', description: 'Instalação e uso offline', icon: Smartphone },
  { path: '/more/backup', title: 'Backup e restauração', description: 'Proteja seus dados locais', icon: DatabaseBackup },
  { path: '/more/settings', title: 'Configurações', description: 'Preferências do aplicativo', icon: Settings },
  { path: '/more/about', title: 'Sobre', description: 'Informações do Poltroy', icon: Info },
] as const

export function MorePage() {
  return (
    <div className="mx-auto w-full max-w-4xl">
      <MorePageHeader title="Mais" description="Recursos e informações do Poltroy." showBack={false} />
      <Card className="mt-6" padding="none">
        <ul aria-label="Recursos do Poltroy" className="divide-y divide-border">
          {sections.map(({ path, title, description, icon: Icon }, index) => (
            <li key={path}>
              <Link to={path} className={`group flex min-h-19 items-center gap-3 px-4 py-4 text-foreground! transition-colors hover:bg-surface-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary motion-reduce:transition-none sm:gap-4 sm:px-6 ${index === 0 ? 'rounded-t-card' : index === sections.length - 1 ? 'rounded-b-card' : ''}`}>
                <span className="flex size-10 shrink-0 items-center justify-center rounded-control bg-primary/5 text-primary"><Icon aria-hidden="true" size={20} strokeWidth={1.8} /></span>
                <span className="min-w-0 flex-1">
                  <span className="block break-words text-sm font-semibold">{title}</span>
                  <span className="mt-1 block break-words text-xs leading-5 text-muted">{description}</span>
                </span>
                <ChevronRight aria-hidden="true" className="shrink-0 text-subtle group-hover:text-primary" size={18} />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
      <p className="mt-4 text-xs leading-5 text-subtle">Seus dados ficam armazenados neste dispositivo.</p>
    </div>
  )
}
