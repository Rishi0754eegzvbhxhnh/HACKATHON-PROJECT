import { useApp } from '../context/AppContext'
import { TRANSLATIONS } from '../lib/translations'

export function useTranslation() {
    const { language } = useApp()

    // Fallback to English if language not in translation dictionary
    const t = (key) => {
        return TRANSLATIONS[language]?.[key] || TRANSLATIONS['en-IN']?.[key] || key
    }

    return { t, language }
}
