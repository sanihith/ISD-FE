import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import './index.css'
import App from './App.tsx'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutes — avoids refetching on every nav/tab switch
      gcTime: 10 * 60 * 1000,    // Keep unused data in cache for 10 minutes
      refetchOnWindowFocus: false,
      retry: 1,                  // Only retry failed requests once instead of 3 times
    },
  },
})

const theme = createTheme({
  palette: {
    primary: {
      main: '#2563eb',
      contrastText: '#ffffff'
    },
    secondary: {
      main: '#1d4ed8',
      contrastText: '#ffffff'
    }
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true
      },
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600
        },
        contained: {
          boxShadow: 'none'
        },
        outlined: {
          borderColor: '#bfdbfe',
          color: '#1d4ed8'
        },
        text: {
          color: '#2563eb'
        }
      }
    }
  }
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
