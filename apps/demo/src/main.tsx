import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { Providers } from '@/app/Providers'

const rootElement = document.getElementById('app')

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <Providers />
    </StrictMode>,
  )
}
