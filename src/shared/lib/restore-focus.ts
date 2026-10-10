/** Return to a surviving trigger, or to a stable page heading after it is removed. */
export function restoreFocus(preferred: HTMLElement | null) {
  if (document.querySelector('dialog[open]')) return
  const candidate = preferred?.isConnected ? preferred : preferred?.id ? document.getElementById(preferred.id) : null
  if (candidate && candidate.getClientRects().length && !candidate.matches(':disabled, [aria-disabled="true"]')
    && !candidate.closest('dialog:not([open])')) {
    candidate.focus()
    return
  }
  const heading = document.querySelector<HTMLElement>('main h2[tabindex="-1"]')
    ?? document.querySelector<HTMLElement>('header h1[tabindex="-1"]')
  heading?.focus()
}
