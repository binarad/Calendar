import express from 'express'
import bodyParser from 'body-parser'
import { CalendarService } from './services/CalendarService'

const app = express()
app.use(bodyParser.json())

const service = new CalendarService()

app.get('/', (_req, res) => {
	res.send('CALENDAR API')
})
// Events CRUD (minimal)
app.get('/events', async (_req, res) => {
	const events = await service.listEvents()
	res.json(events)
})

// Get 1 event by Event ID
app.get('/events/:id', async (req, res) => {
	const event = await service.getEvent(Number(req.params.id))
	res.json(event)
})

// Post Event
app.post('/events', async (req, res) => {
	try {
		const created = await service.createEvent(req.body)
		// schedule reminders for near-future occurrences
		service.scheduleRemindersForEvent(created.id!)
		res.status(201).json(created)
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// Update / Delete Event
app.put('/events/:id', async (req, res) => {
	try {
		const updated = await service.updateEvent(Number(req.params.id), req.body)
		res.json(updated)
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

app.delete('/events/:id', async (req, res) => {
	try {
		await service.deleteEvent(Number(req.params.id))
		res.status(204).end()
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// Occurrences expansion
app.get('/events/:id/occurrences', async (req, res) => {
	const { from, to } = req.query as { from: string; to: string }
	try {
		const occurrences = await service.getOccurrences(
			Number(req.params.id),
			from,
			to
		)
		res.json(occurrences)
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// Reminder endpoints
app.post('/events/:id/reminders', async (req, res) => {
	try {
		const { minutesBefore } = req.body as { minutesBefore: number }
		const eventId = Number(req.params.id)
		const created = await service['reminders'].create({
			eventId,
			minutesBefore,
		})
		// refresh schedule for this event
		service.scheduleRemindersForEvent(eventId)
		res.status(201).json(created)
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

app.get('/events/:id/reminders', async (req, res) => {
	try {
		const eventId = Number(req.params.id)
		const list = await service['reminders'].getByEvent(eventId)
		res.json(list)
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// Delete all reminders
app.delete('/events/:id/reminders', async (req, res) => {
	try {
		const eventId = Number(req.params.id)
		await service['reminders'].deleteByEvent(eventId)
		res.status(204).end()
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// Delete reminder by ID
app.delete('/events/:eventId/reminders/:reminderId', async (req, res) => {
	try {
		const eventId = Number(req.params.eventId)
		const reminderId = Number(req.params.reminderId)

		await service['reminders'].deleteByReminderID(eventId, reminderId)
		res.status(204).end()
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// iCal export
app.get('/events/:id/ical', async (req, res) => {
	try {
		const cal = await service.exportEventAsICal(Number(req.params.id))
		res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
		res.setHeader(
			'Content-Disposition',
			`attachment; filename="event-${req.params.id}.ics"`
		)
		res.send(cal.toString())
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

// iCal export for entire calendar
app.get('/calendar.ics', async (_req, res) => {
	try {
		const cal = await service.exportAllAsICal()
		res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
		res.setHeader('Content-Disposition', `attachment; filename="calendar.ics"`)
		res.send(cal.toString())
	} catch (e: any) {
		res.status(400).json({ error: e.message })
	}
})

export default app
