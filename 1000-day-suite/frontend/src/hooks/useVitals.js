import { useState, useEffect, useCallback } from 'react'
import { subscribeToVitals, unsubscribe } from '../lib/supabase'
import { get, post } from '../lib/api'

export function useVitals(userId) {
  const [vitals, setVitals] = useState([])
  const [latest, setLatest] = useState(null)
  const [loading, setLoading] = useState(false)

  // Fetch initial vitals
  const fetchVitals = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await get('/health/vitals?limit=30')
      setVitals(data.vitals || [])
      if (data.vitals?.length) setLatest(data.vitals[0])
    } catch (e) { console.error(e) }
    finally { setLoading(false) }
  }, [userId])

  useEffect(() => {
    fetchVitals()
  }, [fetchVitals])

  // Real-time subscription
  useEffect(() => {
    if (!userId) return
    const channel = subscribeToVitals(userId, (newVital) => {
      setVitals(prev => [newVital, ...prev])
      setLatest(newVital)
    })
    return () => unsubscribe(channel)
  }, [userId])

  const saveVitals = useCallback(async (data) => {
    const res = await post('/health/vitals', data)
    return res.vital
  }, [])

  // Compute risk from values (client-side fast path)
  const computeRisk = useCallback(({ bp_systolic, bp_diastolic, blood_sugar, weight_kg, height_cm, symptom_code, mood }) => {
    let score = 0
    if (bp_systolic >= 160 || bp_diastolic >= 110) score += 40
    else if (bp_systolic >= 140 || bp_diastolic >= 90) score += 25
    else if (bp_systolic >= 130 || bp_diastolic >= 85) score += 12

    if (blood_sugar > 140) score += 25
    else if (blood_sugar > 110) score += 12

    if (symptom_code >= 4) score += 25
    else if (symptom_code >= 2) score += 12

    if (mood >= 3) score += 8

    // New BMI check logic (if weight and height are provided)
    if (weight_kg > 0 && height_cm > 0) {
      const height_m = height_cm / 100;
      const bmi = weight_kg / (height_m * height_m);
      if (bmi < 18.5) score += 15 // Underweight risk during pregnancy
      else if (bmi > 30) score += 15 // High obesity risk
      else if (bmi > 25) score += 5 // Slight overweight risk
    }

    const level = score >= 67 ? 'high' : score >= 34 ? 'medium' : 'low'
    return { score: Math.min(score, 100), level }
  }, [])

  return { vitals, latest, loading, fetchVitals, saveVitals, computeRisk }
}
