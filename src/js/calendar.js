/**
 * Ordavik | Visualização mensal
 * -----------------------------
 * Este módulo SOMENTE desenha o calendário. Os compromissos, tarefas,
 * aniversários e feriados são fornecidos pela camada de eventos (events.js).
 */
import { localKey, formatDay } from "./data.js";
import { replacePreservingState } from "./ui.js";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTH_FORMAT = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

export function renderCalendar({
  container,
  heading,
  year,
  month,
  selectedDate,
  getEvents,
  onSelect,
}) {
  const monthName = MONTH_FORMAT.format(new Date(year, month, 1, 12));
  heading.textContent = monthName[0].toLocaleUpperCase("pt-BR") + monthName.slice(1);
  const fragment = document.createDocumentFragment();

  for (const name of WEEKDAYS) {
    const header = document.createElement("div");
    header.className = "calendar-weekday";
    header.textContent = name;
    fragment.append(header);
  }

  // Primeiro dia da grade = domingo da semana do primeiro dia do mês.
  const first = new Date(year, month, 1, 12);
  first.setDate(first.getDate() - first.getDay());
  const today = localKey(new Date());

  // Seis semanas deixam a altura previsível e permitem navegar pelos meses.
  for (let index = 0; index < 42; index++) {
    const date = new Date(first);
    date.setDate(first.getDate() + index);
    const key = localKey(date);
    const events = getEvents(key);
    const outside = date.getMonth() !== month;
    const selected = key === selectedDate;
    const isToday = key === today;

    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.classList.toggle("is-outside", outside);
    button.classList.toggle("is-today", isToday);
    button.classList.toggle("is-selected", selected);
    button.setAttribute("aria-pressed", String(selected));
    button.setAttribute("aria-label", `${formatDay(key)}. ${events.length} evento(s)`);
    button.dataset.date = key;
    button.dataset.uiKey = `day:${key}`;

    const number = document.createElement("span");
    number.className = "calendar-number";
    number.textContent = String(date.getDate());
    button.append(number);

    // Máximo duas linhas. Mais eventos ficam disponíveis no painel de detalhes.
    for (const event of events.slice(0, 2)) {
      const chip = document.createElement("span");
      chip.className = `calendar-chip type-${event.type}`;
      chip.textContent = `${event.time ? event.time + " " : ""}${event.title}`;
      chip.title = event.title;
      button.append(chip);
    }
    if (events.length > 2) {
      const more = document.createElement("span");
      more.className = "calendar-more";
      more.textContent = `+ ${events.length - 2} outros`;
      button.append(more);
    }
    button.addEventListener("click", () => onSelect(key));
    fragment.append(button);
  }
  replacePreservingState(container, [fragment]);
}
