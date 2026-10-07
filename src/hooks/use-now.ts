import { useEffect, useState } from 'react'

/** Re-render périodique (rafraîchit les « il y a … » et les règles temporelles) */
export function useNow(intervalMs = 10_000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), intervalMs)

    return () => clearInterval(t)
  }, [intervalMs])

  return now
}
