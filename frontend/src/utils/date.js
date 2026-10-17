export function formatTime(time) {
  if (!time) return ''
  const [hours, minutes] = time.slice(0, 5).split(':').map(Number)
  return new Intl.DateTimeFormat('en-PH', { hour: 'numeric', minute: '2-digit' }).format(new Date(2020, 0, 1, hours, minutes))
}