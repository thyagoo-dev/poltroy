export function getShellBusContext(pathname: string): 'link' | 'indicator' | null {
  switch (pathname) {
    case '/':
    case '/trips':
    case '/trips/':
      return 'link'
    case '/buses':
    case '/buses/':
      return 'indicator'
    default:
      // Only current operational routes qualify; unknown descendants are NotFound.
      return null
  }
}
