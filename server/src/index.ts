import app from './app'
import { NotificationCenter } from './services/NotificationCenter'

const PORT = process.env.PORT ? Number(process.env.PORT) : 3001
app.listen(PORT, () => {
	console.log(`Server listening on http://localhost:${PORT}`)
})

// Log reminders to console for now
const nc = NotificationCenter.getInstance()
nc.on('reminder', payload => {
	console.log(
		`[REMINDER] Event ${payload.eventId} at ${payload.when} (-${payload.minutesBefore}m)`
	)
})
