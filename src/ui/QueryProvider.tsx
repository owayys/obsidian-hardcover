import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import * as React from "react"

const SECOND = 1000
const MINUTE = 60 * SECOND

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 3,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      staleTime: 5 * MINUTE,
      gcTime: 10 * MINUTE,
    },
    mutations: {
      retry: 1,
    },
  },
})

interface HardcoverQueryProviderProps {
  children: React.ReactNode
}

export const HardcoverQueryProvider: React.FC<HardcoverQueryProviderProps> = ({
  children,
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  )
}

export { queryClient }
