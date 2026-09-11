import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { DemoProvider } from './demo/DemoContext'
import { TrainProvider } from './context/TrainContext'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      refetchOnWindowFocus: false,
      retry: 1,
      refetchInterval: false,
    },
  },
})

if (import.meta.env.DEV) {
  import('./mocks/browser').then(({ worker }) => {
    worker.start({ onUnhandledRequest: 'bypass' })
  })
}

const isDemoEnabled = import.meta.env.VITE_DEMO_MODE !== 'false';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <DemoProvider enabled={isDemoEnabled}>
        <TrainProvider>
          <App />
        </TrainProvider>
      </DemoProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </StrictMode>,
)