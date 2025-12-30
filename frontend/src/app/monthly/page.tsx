'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

const MONTH_SLUG_NAMES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
]

export default function MonthlyRedirect() {
  const router = useRouter()

  useEffect(() => {
    const currentDate = new Date()
    const currentYear = currentDate.getFullYear()
    const currentMonth = currentDate.getMonth()
    const monthSlug = MONTH_SLUG_NAMES[currentMonth]
    
    router.replace(`/monthly/${currentYear}/${monthSlug}`)
  }, [router])

  return null
}
