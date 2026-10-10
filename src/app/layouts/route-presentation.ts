const pageTitles: Readonly<Record<string, string>> = {
  '/': 'Mapa', '/trips': 'Viagens', '/buses': 'Ônibus', '/passengers': 'Passageiros',
  '/passengers/new': 'Novo passageiro', '/more': 'Mais', '/more/app': 'Aplicativo',
  '/more/backup': 'Backup e restauração', '/more/settings': 'Configurações', '/more/about': 'Sobre',
}

export function getPassengerTitleId(pathname: string): string | undefined {
  pathname = pathname.replace(/\/+$/, '') || '/'
  if (pathname === '/passengers/new') return undefined
  const match = /^\/passengers\/([^/]+)$/.exec(pathname)
  if (!match) return undefined
  try { return decodeURIComponent(match[1]) } catch { return undefined }
}

export function getRoutePresentation(pathname: string, passengerName?: string) {
  pathname = pathname.replace(/\/+$/, '') || '/'
  const details = getPassengerTitleId(pathname) !== undefined
  const edit = /^\/passengers\/[^/]+\/edit$/.test(pathname)
  const pageTitle = pageTitles[pathname] ?? (details ? passengerName || 'Cadastro do passageiro'
    : edit ? 'Editar passageiro' : 'Página não encontrada')
  const sectionTitle = pathname === '/passengers/new' || details || edit ? 'Passageiros'
    : pathname in pageTitles && pathname.startsWith('/more/') ? 'Mais' : pageTitle
  return { sectionTitle, documentTitle: `${pageTitle} — Poltroy` }
}
