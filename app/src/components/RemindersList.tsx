import { useState } from 'react'

import {
	List,
	ListItemIcon,
	ListItemButton,
	Collapse,
	ListItemText,
} from '@mui/material'

import { ExpandMore, StarBorder } from '@mui/icons-material'
import { ExpandLess } from '@mui/icons-material'

export default function RemindersList() {
	const [open, setOpen] = useState<boolean>(false)
	return (
		<List>
			<ListItemButton onClick={() => setOpen(!open)}>
				<ListItemText primary='All Events'>
					{open ? <ExpandLess /> : <ExpandMore />}
				</ListItemText>
			</ListItemButton>
			<Collapse in={open} timeout='auto' unmountOnExit>
				<List component='div' disablePadding>
					<ListItemButton>
						<ListItemIcon>
							<StarBorder />
						</ListItemIcon>
						<ListItemText primary='Math' />
					</ListItemButton>
					<ListItemIcon>
						<StarBorder />
					</ListItemIcon>
					<ListItemText primary='Labs' />
					<ListItemIcon>
						<StarBorder />
					</ListItemIcon>
					<ListItemText primary='English' />
					<ListItemIcon>
						<StarBorder />
					</ListItemIcon>
					<ListItemText primary='Physics' />
				</List>
			</Collapse>
		</List>
	)
}
