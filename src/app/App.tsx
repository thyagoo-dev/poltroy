import { AppRouter } from '@/app/router/AppRouter'
import { PwaInstallProvider } from '@/app/pwa/PwaInstallProvider'

function App() {
  return <PwaInstallProvider><AppRouter /></PwaInstallProvider>
}

export default App
