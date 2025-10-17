import { useState, useCallback, useRef, useEffect } from "react";
import type { EventApi, DateSelectArg } from "@fullcalendar/core";
import { Sidebar } from "./components/Sidebar";
import { useCalendarHandlers } from "./hooks/useCalendarHandlers";
import type { Reminder, SelectedEvent, UpcomingEvent } from "./types";
import { Calendar } from "./components/Calendar";
import EventModal, { type EventFormData } from "./components/EventModal";
import { createEvent, updateEvent } from "./services/eventsMutations";
import FullCalendar from "@fullcalendar/react"; // Needed for the ref type

export default function App() {
  const [currentEvents, setCurrentEvents] = useState<EventApi[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SelectedEvent | null>(
    null,
  );
  const [selectedReminders, setSelectedReminders] = useState<Reminder[]>([]);
  const [selectedOccurrences, setSelectedOccurrences] = useState<string[]>([]);
  const [selectedOccurrence, setSelectedOccurrence] = useState<string | null>(
    null,
  );

  const [upcomingEvents, setUpcomingEvents] = useState<UpcomingEvent[]>([]);

  // State for the Modal
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalInitialData, setModalInitialData] =
    useState<Partial<EventFormData> | null>(null);

  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const res = await fetch("/api/events/upcoming");
        if (!res.ok) throw new Error("Failed to fetch upcoming events");
        const data = await res.json();
        setUpcomingEvents(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUpcomingEvents();
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalInitialData(null);
  };

  const handleOpenCreateModal = useCallback((selectInfo: DateSelectArg) => {
    selectInfo.view.calendar.unselect(); // Clear date selection
    setModalInitialData({
      startTime: selectInfo.startStr,
      endTime: selectInfo.endStr,
    });
    setIsModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback(() => {
    if (!selectedEvent) return;
    setModalInitialData(selectedEvent);
    setIsModalOpen(true);
  }, [selectedEvent]);

  const handleSaveEvent = useCallback(
    async (data: EventFormData) => {
      try {
        if (selectedEvent) {
          const updated = await updateEvent(selectedEvent.id, data);
          setSelectedEvent(updated);
        } else {
          await createEvent(data);
        }
        handleCloseModal();
        calendarRef.current?.getApi().refetchEvents();
      } catch (e: any) {
        console.error(e);
        alert(`Failed to save event: ${e.message}`);
      }
    },
    [selectedEvent],
  );
  const {
    fetchEvents,
    handleEventClick,
    handleAddReminder,
    handleDeleteReminder,
    handleSelectOccurrence,
    handleEditEvent,
    handleDeleteEvent,
    handleEvents,
    handleEventDrop,
  } = useCalendarHandlers({
    selectedEvent,
    selectedOccurrence,
    setCurrentEvents,
    setSelectedEvent,
    setSelectedReminders,
    setSelectedOccurrences,
    setSelectedOccurrence,
    onOpenEditModal: handleOpenEditModal,
    calendarRef: calendarRef,
  });

  const handleUpcomingEventClick = (eventId: number) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      const event = calendarApi.getEventById(String(eventId));
      if (event) {
        handleEventClick({ event } as any);
      }
    }
  };
  // Notifications
  useEffect(() => {
    // ------ 1. Request notification permission on mount --------
    if (Notification.permission !== "granted") {
      Notification.requestPermission();
    }

    // ----- 2. Connect to the server -----
    // EventSource is the browser's built-in client for SSE
    const eventSource = new EventSource("api/notifications");

    // ----- 3. Handle incoming messages -----
    eventSource.onmessage = (event) => {
      // Parse data from the server
      const reminder = JSON.parse(event.data);

      // Check if permission is granted
      if (Notification.permission === "granted") {
        // Show notification
        new Notification(reminder.title, {
          body: `Your event ${reminder.eventTitle}`,
          icon: "../public/calendar-icon.png",
        });
      }
    };

    // Handle any errors with the connection
    eventSource.onerror = (err) => {
      console.error(`EventSource failed: ${err}`);
      eventSource.close();
    };

    // ----- 4. Clean Up on Unmount -----
    return () => {
      console.log("Closing notification connection");
      eventSource.close();
    };
  }, []);

  return (
    <div className="app">
      <div className="app-main">
        <Calendar
          ref={calendarRef}
          fetchEvents={fetchEvents}
          handleEventClick={handleEventClick}
          handleEvents={handleEvents}
          handleDateSelect={handleOpenCreateModal}
          handleEventDrop={handleEventDrop}
        />
      </div>
      <Sidebar
        currentEvents={currentEvents}
        selectedEvent={selectedEvent}
        selectedReminders={selectedReminders}
        selectedOccurrences={selectedOccurrences}
        selectedOccurrence={selectedOccurrence}
        onAddReminder={handleAddReminder}
        onDeleteReminder={handleDeleteReminder}
        onSelectOccurrence={handleSelectOccurrence}
        onEditEvent={handleEditEvent}
        onDeleteEvent={handleDeleteEvent}
        upcomingEvents={upcomingEvents}
        onUpcomingEventClick={handleUpcomingEventClick}
      />
      <EventModal
        open={isModalOpen}
        initialData={modalInitialData}
        onClose={handleCloseModal}
        onSave={handleSaveEvent}
      />
    </div>
  );
}
