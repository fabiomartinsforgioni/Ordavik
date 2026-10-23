import {
  validDate,
  todayKey,
  formatDay,
  yearlyDate,
  localKey,
  fallbackHolidays,
  getNationalHolidays,
} from "./data.js";
import { $, element, actionButton, renderEmpty } from "./ui.js";
import { renderCalendar } from "./calendar.js";

export function initEvents(ctx) {
  const { tasks, meetings, celebrations } = ctx.state;
  const showView = ctx.navigate;
  const TYPE_LABELS = {
    task: "Tarefa",
    meeting: "Compromisso",
    birthday: "Aniversário",
    special: "Data especial",
    holiday: "Feriado nacional",
  };
  let currentMonth = new Date().getMonth(),
    currentYear = new Date().getFullYear(),
    selectedDate = todayKey();
  const holidayYears = new Map();
  function eventsForDate(day) {
    if (!validDate(day)) return [];
    const year = Number(day.slice(0, 4));
    const events = [];
    for (const task of tasks) {
      if (task.dueDate === day)
        events.push({
          type: "task",
          id: task.id,
          title: task.description,
          time: task.dueTime,
          note: task.details,
          completed: task.completed,
        });
    }
    for (const meeting of meetings) {
      if (meeting.date === day)
        events.push({
          type: "meeting",
          id: meeting.id,
          title: meeting.title,
          time: meeting.startTime,
          note: meeting.details,
        });
    }
    for (const celebration of celebrations) {
      if (yearlyDate(celebration, year) === day) {
        const age = year - Number(celebration.date.slice(0, 4));
        const ageText = celebration.kind === "birthday" && age >= 0 ? ` • ${age} ano(s)` : "";
        events.push({
          type: celebration.kind,
          id: celebration.id,
          title: celebration.name,
          time: "",
          note: `${celebration.notes}${ageText}`.trim(),
        });
      }
    }
    const holidays = holidayYears.get(year)?.holidays || fallbackHolidays(year);
    for (const holiday of holidays) {
      if (holiday.date === day)
        events.push({
          type: "holiday",
          id: holiday.date,
          title: holiday.name,
          time: "",
          note: "Feriado nacional brasileiro",
        });
    }
    return events.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
  }

  function eventRow(event) {
    const row = element("article", `event-row event-type-${event.type}`);
    const info = element("div", "event-info");
    const title = event.completed ? `${event.title} ✓` : event.title;
    info.append(element("strong", "event-title", title));
    info.append(
      element(
        "p",
        "event-subtitle",
        `${TYPE_LABELS[event.type]}${event.time ? ` • ${event.time}` : ""}`,
      ),
    );
    if (event.note) info.append(element("p", "event-note", event.note));
    const actions = element("div", "item-actions");
    if (event.type === "task")
      actions.append(
        actionButton(`Editar tarefa ${event.title}`, "pencil-square", () =>
          ctx.tasks.edit(event.id),
        ),
      );
    if (event.type === "meeting")
      actions.append(
        actionButton(`Editar compromisso ${event.title}`, "pencil-square", () =>
          ctx.agenda.editMeeting(event.id),
        ),
      );
    if (["birthday", "special"].includes(event.type))
      actions.append(
        actionButton(`Editar ${event.title}`, "pencil-square", () =>
          ctx.agenda.editCelebration(event.id),
        ),
      );
    row.append(element("span", `legend-dot type-${event.type}`), info, actions);
    return row;
  }

  function renderDayEvents() {
    $("#calendar-selected-heading").textContent = formatDay(selectedDate);
    const target = $("#calendar-day-events");
    const events = eventsForDate(selectedDate);
    target.replaceChildren(
      ...(events.length
        ? events.map(eventRow)
        : [renderEmpty("Nenhum evento neste dia. Selecione + Compromisso para agendar.")]),
    );
  }

  function renderCalendarUI() {
    renderCalendar({
      container: $("#calendar-grid"),
      heading: $("#calendar-month"),
      year: currentYear,
      month: currentMonth,
      selectedDate,
      getEvents: eventsForDate,
      onSelect(day) {
        selectedDate = day;
        const date = new Date(`${day}T12:00:00`);
        if (date.getFullYear() !== currentYear || date.getMonth() !== currentMonth) {
          currentYear = date.getFullYear();
          currentMonth = date.getMonth();
          ensureHolidays(currentYear);
        }
        renderCalendarUI();
      },
    });
    renderDayEvents();
    const source = holidayYears.get(currentYear)?.source;
    $("#holidays-status").textContent =
      source === "BrasilAPI"
        ? "Feriados nacionais do Brasil consultados na BrasilAPI. Pontos facultativos não são incluídos."
        : "Feriados nacionais do Brasil calculados localmente (consulta on-line em andamento ou indisponível). Feriados estaduais e municipais não estão incluídos.";
  }

  async function ensureHolidays(year) {
    if (holidayYears.has(year)) return;
    const result = await getNationalHolidays(year);
    holidayYears.set(year, result);
    if (year === currentYear) renderCalendarUI();
    if (year === new Date().getFullYear()) ctx.renderDashboard();
  }

  function changeMonth(offset) {
    // Date normaliza transições, inclusive dezembro -> janeiro e vice-versa.
    const next = new Date(currentYear, currentMonth + offset, 1, 12);
    currentYear = next.getFullYear();
    currentMonth = next.getMonth();
    selectedDate = localKey(next);
    renderCalendarUI();
    ensureHolidays(currentYear);
  }

  function selectToday() {
    const now = new Date();
    currentMonth = now.getMonth();
    currentYear = now.getFullYear();
    selectedDate = todayKey();
    renderCalendarUI();
    ensureHolidays(currentYear);
  }

  function openMeetingForSelectedDate() {
    showView("agenda");
    ctx.agenda.resetMeetingForm();
    $("#agenda-date").value = selectedDate;
    ctx.agenda.meetingFields.date.value = selectedDate;
    ctx.agenda.renderAgenda();
    ctx.agenda.meetingFields.title.focus();
    $("#meeting-form").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  $("#calendar-prev").addEventListener("click", () => changeMonth(-1));
  $("#calendar-next").addEventListener("click", () => changeMonth(1));
  $("#calendar-today").addEventListener("click", selectToday);
  $("#calendar-add").addEventListener("click", openMeetingForSelectedDate);
  $("#calendar-day-add").addEventListener("click", openMeetingForSelectedDate);

  return {
    render: renderCalendarUI,
    eventsForDate,
    eventRow,
    start: () => ensureHolidays(currentYear),
  };
}
