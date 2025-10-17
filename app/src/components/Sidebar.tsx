import type { EventApi } from "@fullcalendar/core";
import { formatDate } from "@fullcalendar/core";
import type { Reminder, SelectedEvent, UpcomingEvent } from "../types";
import Button from "@mui/material/Button";
import DeleteIcon from "@mui/icons-material/Delete";
import FormControl from "@mui/material/FormControl";
// import InputLabel from '@mui/material/InputLabel'
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useState } from "react";
import RemindersList from "./RemindersList";

type SidebarProps = {
  currentEvents: EventApi[];
  selectedEvent: SelectedEvent | null;
  selectedReminders: Reminder[];
  selectedOccurrences: string[];
  selectedOccurrence?: string | null;
  onAddReminder?: (minutesBefore: number) => void;
  onDeleteReminder?: (minutesBefore: number) => void;
  onSelectOccurrence?: (occurrenceIso: string) => void;
  onEditEvent?: () => void;
  onDeleteEvent?: () => void;
  upcomingEvents: UpcomingEvent[];
  onUpcomingEventClick?: (eventId: number) => void;
};

function renderSidebarEvent(event: EventApi) {
  return (
    <li key={event.id}>
      <b>
        {formatDate(event.start!, {
          year: "numeric",
          month: "short",
          day: "numeric",
        })}
      </b>
      <i>{event.title}</i>
    </li>
  );
}

async function handleReminderDelete(eventId: number, reminderId: number) {
  const res = await fetch(`/api/events/${eventId}/reminders/${reminderId}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    console.error(
      `Failed to DELETE Reminder  with ID: ${reminderId} for event with ID: ${eventId}`,
    );
    return;
  }

  console.log(
    `Reminder with ID ${reminderId} for Event with ID: ${eventId} deleted successfully`,
  );

  // Call parent callback to update UI
}

export function Sidebar({
  currentEvents,
  selectedEvent,
  selectedReminders,
  selectedOccurrences,
  selectedOccurrence,
  onAddReminder,
  onDeleteReminder,
  onSelectOccurrence,
  onEditEvent,
  onDeleteEvent,
  upcomingEvents,
  onUpcomingEventClick,
}: SidebarProps) {
  const [reminderSelect, setReminderSelect] = useState<string>("");

  return (
    <div className="app-sidebar">
      {selectedEvent ? (
        <div className="sidebar-event-details">
          <h2>Event Details</h2>
          <div>
            <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
              {onEditEvent ? (
                <Button variant="contained" size="small" onClick={onEditEvent}>
                  Edit
                </Button>
              ) : null}
              {onDeleteEvent ? (
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  startIcon={<DeleteIcon />}
                  onClick={onDeleteEvent}
                >
                  Delete
                </Button>
              ) : null}
            </div>
            <div>
              <b>Title:</b> {selectedEvent.title}
            </div>
            {selectedEvent.description ? (
              <div>
                <b>Description:</b> {selectedEvent.description}
              </div>
            ) : null}
            <div>
              <b>Start:</b>{" "}
              {new Date(selectedEvent.startTime).toLocaleString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </div>
            {selectedEvent.endTime ? (
              <div>
                <b>End:</b>{" "}
                {new Date(selectedEvent.endTime).toLocaleString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })}
              </div>
            ) : null}
            <div style={{ marginTop: 12 }} className="sidebar-reminders">
              <h1>
                <b>Reminder</b>{" "}
              </h1>
              <div style={{ marginTop: 8 }}>
                <FormControl
                  id="form-root"
                  size="small"
                  variant="standard"
                  sx={{
                    height: "100%",
                    fontSize: 10,
                    width: "100%",
                  }}
                >
                  <Select
                    displayEmpty
                    value={reminderSelect}
                    onChange={(e: SelectChangeEvent) => {
                      const val = Number(e.target.value);
                      if (!isNaN(val) && onAddReminder && selectedEvent)
                        onAddReminder(val);
                      setReminderSelect("");
                    }}
                  >
                    <MenuItem disabled value="">
                      Select minutes
                    </MenuItem>
                    <MenuItem value={5}>5 minutes before</MenuItem>
                    <MenuItem value={10}>10 minutes before</MenuItem>
                    <MenuItem value={15}>15 minutes before</MenuItem>
                    <MenuItem value={30}>30 minutes before</MenuItem>
                    <MenuItem value={60}>60 minutes before</MenuItem>
                  </Select>
                </FormControl>
              </div>
              <ul>
                {selectedReminders.length ? (
                  selectedReminders.map((r) => (
                    <li key={`${r.eventId}-${r.minutesBefore}`}>
                      {r.minutesBefore} minutes before{" "}
                      {onDeleteReminder ? (
                        <Button
                          variant="text"
                          size="small"
                          color="error"
                          onClick={() => onDeleteReminder(r.minutesBefore)}
                          style={{ marginLeft: 8 }}
                        >
                          Remove
                        </Button>
                      ) : null}
                    </li>
                  ))
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>
            <div style={{ marginTop: 12 }}>
              <b>Upcoming Occurrences (next 30 days)</b>
              <div style={{ margin: "8px 0" }}>
                <label>
                  Select occurrence:
                  <select
                    value={selectedOccurrence ?? ""}
                    onChange={(e) =>
                      onSelectOccurrence && onSelectOccurrence(e.target.value)
                    }
                    style={{ marginLeft: 8 }}
                  >
                    <option value="">None</option>
                    {selectedOccurrences.map((o) => (
                      <option key={o} value={o}>
                        {new Date(o).toLocaleString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        })}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <ul>
                {selectedOccurrences.length ? (
                  selectedOccurrences.map((o) => (
                    <li key={o}>
                      {new Date(o).toLocaleString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      })}
                    </li>
                  ))
                ) : (
                  <li>None</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      ) : (
        <div className="sidebar-upcoming-events">
          <h2>Upcoming Events</h2>
          {upcomingEvents.length > 0 ? (
            <ul>
              {upcomingEvents.map((event) => (
                <li
                  key={`${event.eventId}-${event.startTime}`}
                  onClick={() => onUpcomingEventClick?.(event.eventId)}
                >
                  <b>
                    {new Date(event.startTime).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </b>
                </li>
              ))}
            </ul>
          ) : (
            <p>No upcoming events in the next 30 days</p>
          )}
        </div>
      )}
    </div>
  );
}

export default Sidebar;
