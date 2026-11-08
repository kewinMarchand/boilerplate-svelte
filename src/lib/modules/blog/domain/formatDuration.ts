const SECONDS_PER_MINUTE = 60
const MINUTES_PER_HOUR = 60

/** Durée lisible d'un audio : « 45 s », « 26 min », « 1 h 05 min ». */
export const formatDuration = (seconds: number) => {
  if (seconds < SECONDS_PER_MINUTE) return `${seconds} s`
  const minutes = Math.round(seconds / SECONDS_PER_MINUTE)
  if (minutes < MINUTES_PER_HOUR) return `${minutes} min`
  const rest = String(minutes % MINUTES_PER_HOUR).padStart(2, '0')
  return `${Math.floor(minutes / MINUTES_PER_HOUR)} h ${rest} min`
}
