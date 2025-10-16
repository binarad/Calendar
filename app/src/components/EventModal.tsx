import { useEffect, useState } from 'react'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select, { type SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'

export type RecurrenceRuleFormData = {
	freq: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'NONE'
	interval?: number
	byday?: string
}
// Define the shape of the data this form will handle
export type EventFormData = {
	title: string
	description: string | null
	startTime: string
	endTime: string | null
	recurrence?: RecurrenceRuleFormData
}

// Define the props our component will accept
type EventModalProps = {
	open: boolean
	onClose: () => void
	onSave: (data: EventFormData) => void
	initialData?: Partial<EventFormData> | null
}

export default function EventModal({
	open,
	onClose,
	onSave,
	initialData,
}: EventModalProps) {
	// State to manage the form fields
	const [formData, setFormData] = useState<EventFormData>({
		title: '',
		description: '',
		startTime: '',
		endTime: '',
		recurrence: { freq: 'NONE' },
	})

	const [error, setError] = useState<string | null>(null)

	// When the modal opens, populate the form with initial data (if any)
	useEffect(() => {
		setError(null)
		if (initialData) {
			setFormData({
				title: initialData.title || '',
				description: initialData.description || '',
				// Format dates for the datetime-local input field
				startTime: initialData.startTime
					? initialData.startTime.slice(0, 16)
					: '',
				endTime: initialData.endTime ? initialData.endTime.slice(0, 16) : '',
				recurrence: { freq: 'NONE' },
			})
		} else {
			// Reset form when creating a new event
			setFormData({
				title: '',
				description: '',
				startTime: '',
				endTime: '',
				recurrence: { freq: 'NONE' },
			})
		}
	}, [initialData, open])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value })
	}

	const handleRecurrenceChange = (
		e:
			| React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
			| SelectChangeEvent
	) => {
		const { name, value } = e.target

		const currentRecurrence = formData.recurrence || { freq: 'NONE' }

		const newRecurrence = {
			...currentRecurrence,
			[name]: value,
		}
		setFormData({
			...formData,
			recurrence: newRecurrence as RecurrenceRuleFormData,
		})
	}
	const handleSave = () => {
		if (!formData.title || !formData.startTime) {
			setError('Title and Start Time are required')
			return
		}

		setError(null)
		// Convert local time back to ISO format for the backend
		const dataToSave = {
			...formData,
			startTime: formData.startTime
				? new Date(formData.startTime).toISOString()
				: '',
			endTime: formData.endTime ? new Date(formData.endTime).toISOString() : '',
			recurrence:
				formData.recurrence?.freq !== 'NONE' ? formData.recurrence : undefined,
		}
		onSave(dataToSave)
	}

	return (
		<Dialog open={open} onClose={onClose}>
			<DialogTitle>
				{initialData?.title ? 'Edit Event' : 'Create New Event'}
			</DialogTitle>
			<DialogContent>
				<TextField
					autoFocus
					margin='dense'
					name='title'
					label='Event Title'
					type='text'
					fullWidth
					variant='outlined'
					value={formData.title}
					onChange={handleChange}
					error={!!error}
					helperText={error}
					required
				/>
				<TextField
					margin='dense'
					name='description'
					label='Description (optional)'
					type='text'
					fullWidth
					multiline
					rows={3}
					variant='outlined'
					value={formData.description || ''}
					onChange={handleChange}
				/>
				<TextField
					margin='dense'
					name='startTime'
					label='Start Time'
					type='datetime-local'
					fullWidth
					required
					variant='outlined'
					value={formData.startTime}
					onChange={handleChange}
					error={!!error}
					helperText={error}
					slotProps={{
						inputLabel: { shrink: true },
					}}
				/>
				<TextField
					margin='dense'
					name='endTime'
					label='End Time (optional)'
					type='datetime-local'
					fullWidth
					variant='outlined'
					value={formData.endTime}
					onChange={handleChange}
					slotProps={{
						inputLabel: { shrink: true },
					}}
				/>
				<FormControl fullWidth margin='dense' variant='outlined'>
					<InputLabel id='repeats-select-label'>Repeats</InputLabel>
					<Select
						labelId='repeats-select-label'
						id='repeats-select'
						name='freq'
						value={formData.recurrence?.freq || 'NONE'}
						label='Repeats'
						onChange={handleRecurrenceChange}
					>
						<MenuItem value='NONE'>Never</MenuItem>
						<MenuItem value='DAILY'>Daily</MenuItem>
						<MenuItem value='WEEKLY'>Weekly</MenuItem>
						<MenuItem value='MONTHLY'>Monthly</MenuItem>
					</Select>
				</FormControl>

				{/* Conditionally show the "byday" input only for weekly events */}
				{formData.recurrence?.freq === 'WEEKLY' && (
					<TextField
						margin='dense'
						name='byday'
						label='On which days? (e.g., MO,TU,WE)'
						helperText='Comma-separated list of two-letter day codes (MO, TU, WE, TH, FR, SA, SU)'
						type='text'
						fullWidth
						variant='standard'
						value={formData.recurrence.byday || ''}
						onChange={handleRecurrenceChange}
					/>
				)}
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose}>Cancel</Button>
				<Button onClick={handleSave}>Save</Button>
			</DialogActions>
		</Dialog>
	)
}
