import { createContext, useContext, useState } from 'react'

const AppCtx = createContext(null)

export function AppProvider({ children }) {
  const [language, setLanguage] = useState('en-IN')
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const [largeText, setLargeText] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [iconMode, setIconMode] = useState(false)

  function showToast(msg, icon = '✅') {
    setToast({ msg, icon })
    setTimeout(() => setToast(null), 3500)
  }

  return (
    <AppCtx.Provider value={{
      language, setLanguage,
      voiceOpen, setVoiceOpen,
      toast, showToast,
      largeText, setLargeText,
      highContrast, setHighContrast,
      iconMode, setIconMode
    }}>
      {children}
    </AppCtx.Provider>
  )
}

export const useApp = () => useContext(AppCtx)
