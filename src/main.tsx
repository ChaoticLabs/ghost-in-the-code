import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { GameProvider, PreferencesProvider } from './engine'
import { AnimationProvider } from './animations/AnimationController'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <PreferencesProvider>
      <GameProvider>
        <AnimationProvider>
          <App />
        </AnimationProvider>
      </GameProvider>
    </PreferencesProvider>
  </StrictMode>,
)
