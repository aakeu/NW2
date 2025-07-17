import {
  format,
  isToday,
  isYesterday,
  differenceInDays,
  parseISO,
} from 'date-fns'

export async function organizeGptHistory(historyEntries) {
  const today = []
  const yesterday = []
  const previous7Days = []
  const previous30Days = []
  const older = []

  Array.isArray(historyEntries) &&
    historyEntries.length > 0 &&
    historyEntries.forEach((entry) => {
      const date = parseISO(entry.date)
      if (isToday(date)) {
        today.push(entry)
      } else if (isYesterday(date)) {
        yesterday.push(entry)
      } else {
        const daysAgo = differenceInDays(new Date(), date)
        if (daysAgo <= 7) {
          previous7Days.push(entry)
        } else if (daysAgo <= 30) {
          previous30Days.push(entry)
        } else {
          older.push(entry)
          // const monthYear = format(date, 'MMMM yyyy')
          // if (!older[monthYear]) older[monthYear] = []
          // older[monthYear].push(entry)
        }
      }
    })

  return { today, yesterday, previous7Days, previous30Days, older }
}
