import {
  STORAGE_KEYS,
  CATEGORIES,
  KINDS,
  todayKey,
  formatDate,
  uniqueId,
  normalizeMeeting,
  normalizeCelebration,
  yearlyDate,
} from "./data.js";
import { $, element, actionButton, renderEmpty } from "./ui.js";

export function initAgenda(ctx) {
  const { meetings, celebrations } = ctx.state;
  let editingMeetingId = null,
    editingCelebrationId = null;
  const { persist, notify: showMessage, navigate: showView, refresh: renderAll } = ctx;
  const meetingForm = $("#meeting-form");
  const meetingFields = {
    title: $("#meeting-title"),
    date: $("#meeting-date"),
    start: $("#meeting-start"),
    end: $("#meeting-end"),
    category: $("#meeting-category"),
    project: $("#meeting-project"),
    location: $("#meeting-location"),
    details: $("#meeting-details"),
    clientId: $("#meeting-client"),
  };
  function syncClients(value = meetingFields.clientId.value) {
    const first = element("option", "", "Sem cliente");
    first.value = "";
    meetingFields.clientId.replaceChildren(
      first,
      ...ctx.state.clients
        .filter((c) => !c.archived || c.id === value)
        .map((c) => {
          const option = element("option", "", c.name);
          option.value = c.id;
          return option;
        }),
    );
    meetingFields.clientId.value = value;
  }
  function resetMeetingForm() {
    meetingForm.reset();
    editingMeetingId = null;
    meetingFields.end.setCustomValidity("");
    meetingFields.date.value = $("#agenda-date").value || todayKey();
    $("#meeting-form-heading").textContent = "Novo compromisso";
    $("#meeting-submit").textContent = "Adicionar compromisso";
    $("#meeting-cancel").hidden = true;
  }
  meetingFields.end.addEventListener("input", () => meetingFields.end.setCustomValidity(""));
  meetingFields.start.addEventListener("input", () => meetingFields.end.setCustomValidity(""));
  $("#meeting-cancel").addEventListener("click", resetMeetingForm);
  meetingForm.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editingMeetingId) {
      event.preventDefault();
      resetMeetingForm();
    }
  });

  function editMeeting(id) {
    const meeting = meetings.find((item) => item.id === id);
    if (!meeting) return;
    editingMeetingId = id;
    syncClients(meeting.clientId);
    for (const [name, field] of Object.entries(meetingFields)) {
      field.value =
        name === "start"
          ? meeting.startTime
          : name === "end"
            ? meeting.endTime
            : name === "title"
              ? meeting.title
              : meeting[name] || "";
    }
    meetingFields.end.setCustomValidity("");
    $("#meeting-form-heading").textContent = "Editar compromisso";
    $("#meeting-submit").textContent = "Salvar alterações";
    $("#meeting-cancel").hidden = false;
    showView("agenda");
    meetingForm.scrollIntoView({ behavior: "smooth", block: "start" });
    meetingFields.title.focus({ preventScroll: true });
  }

  meetingForm.addEventListener("submit", (event) => {
    event.preventDefault();
    meetingFields.end.setCustomValidity("");
    if (!meetingForm.reportValidity()) return;
    if (meetingFields.end.value <= meetingFields.start.value) {
      meetingFields.end.setCustomValidity("O término deve ser posterior ao início.");
      meetingFields.end.reportValidity();
      return;
    }
    const original = meetings.find((item) => item.id === editingMeetingId);
    const meeting = normalizeMeeting({
      id: original?.id || uniqueId(),
      title: meetingFields.title.value,
      date: meetingFields.date.value,
      startTime: meetingFields.start.value,
      endTime: meetingFields.end.value,
      category: meetingFields.category.value,
      project: meetingFields.project.value,
      clientId: meetingFields.clientId.value,
      details: meetingFields.details.value,
      location: meetingFields.location.value,
    });
    if (!meeting) {
      showMessage("Confira os dados do compromisso.", "error");
      return;
    }
    if (original) Object.assign(original, meeting);
    else meetings.push(meeting);
    $("#agenda-date").value = meeting.date;
    persist(STORAGE_KEYS.meetings, meetings);
    resetMeetingForm();
    renderAll();
    showMessage(original ? "Compromisso atualizado." : "Compromisso agendado.");
  });

  function deleteMeeting(id) {
    const meeting = meetings.find((item) => item.id === id);
    if (!meeting || !confirm(`Excluir o compromisso "${meeting.title}"?`)) return;
    meetings.splice(0, meetings.length, ...meetings.filter((item) => item.id !== id));
    if (editingMeetingId === id) resetMeetingForm();
    persist(STORAGE_KEYS.meetings, meetings);
    renderAll();
    showMessage("Compromisso excluído.");
  }

  /** URLs só viram links clicáveis se tiverem protocolo HTTP ou HTTPS válido. */
  function safeHttpUrl(location) {
    try {
      const url = new URL(location);
      return ["http:", "https:"].includes(url.protocol) ? url.href : null;
    } catch {
      return null;
    }
  }

  function meetingRow(meeting) {
    const row = element("article", "event-row");
    const content = element("div", "event-info");
    content.append(element("strong", "event-title", meeting.title));
    content.append(
      element(
        "p",
        "event-subtitle",
        `${formatDate(meeting.date)} • ${meeting.startTime}–${meeting.endTime} • ${CATEGORIES[meeting.category]}`,
      ),
    );
    if (meeting.project) content.append(element("p", "event-note", `Projeto: ${meeting.project}`));
    if (meeting.details) content.append(element("p", "event-note", meeting.details));
    if (meeting.location) {
      const locationText = element("p", "event-note");
      const href = safeHttpUrl(meeting.location);
      if (href) {
        const link = element("a", "event-link", meeting.location);
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        locationText.append(link);
      } else locationText.textContent = `Local: ${meeting.location}`;
      content.append(locationText);
    }
    const actions = element("div", "item-actions");
    actions.append(
      actionButton(`Editar compromisso: ${meeting.title}`, "pencil-square", () =>
        editMeeting(meeting.id),
      ),
    );
    actions.append(
      actionButton(
        `Excluir compromisso: ${meeting.title}`,
        "trash3",
        () => deleteMeeting(meeting.id),
        "danger",
      ),
    );
    row.append(element("span", "legend-dot type-meeting"), content, actions);
    return row;
  }

  function renderAgenda() {
    syncClients();
    const target = $("#agenda-content");
    target.replaceChildren();
    const day = $("#agenda-date").value || todayKey();
    const sorted = [...meetings].sort((a, b) =>
      `${a.date}T${a.startTime}`.localeCompare(`${b.date}T${b.startTime}`),
    );
    const daily = sorted.filter((item) => item.date === day);
    const upcoming = sorted.filter((item) => item.date > day).slice(0, 8);
    target.append(element("h4", "list-subheading", `Dia ${formatDate(day)}`));
    if (daily.length) daily.forEach((item) => target.append(meetingRow(item)));
    else target.append(renderEmpty("Nenhum compromisso nesta data."));
    target.append(element("h4", "list-subheading mt-3", "Próximos compromissos"));
    if (upcoming.length) upcoming.forEach((item) => target.append(meetingRow(item)));
    else target.append(renderEmpty("Nenhum próximo compromisso cadastrado."));
  }

  $("#agenda-date").addEventListener("input", () => {
    resetMeetingForm();
    renderAgenda();
  });
  $("#agenda-today").addEventListener("click", () => {
    $("#agenda-date").value = todayKey();
    resetMeetingForm();
    renderAgenda();
  });

  // ---------------------------------------------------------------------------
  // 5. DATAS RECORRENTES: ANIVERSÁRIOS E COMEMORAÇÕES
  // ---------------------------------------------------------------------------

  const celebrationForm = $("#celebration-form");
  const celebrationFields = {
    name: $("#celebration-name"),
    kind: $("#celebration-kind"),
    date: $("#celebration-date"),
    notes: $("#celebration-notes"),
  };

  function resetCelebrationForm() {
    celebrationForm.reset();
    editingCelebrationId = null;
    $("#celebration-form-heading").textContent = "Aniversários e datas especiais";
    $("#celebration-submit").textContent = "Adicionar data";
    $("#celebration-cancel").hidden = true;
  }
  $("#celebration-cancel").addEventListener("click", resetCelebrationForm);
  celebrationForm.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && editingCelebrationId) {
      event.preventDefault();
      resetCelebrationForm();
    }
  });

  function editCelebration(id) {
    const celebration = celebrations.find((item) => item.id === id);
    if (!celebration) return;
    editingCelebrationId = id;
    Object.entries(celebrationFields).forEach(([name, field]) => {
      field.value = celebration[name] || "";
    });
    $("#celebration-form-heading").textContent = "Editar data especial";
    $("#celebration-submit").textContent = "Salvar alterações";
    $("#celebration-cancel").hidden = false;
    showView("agenda");
    celebrationForm.scrollIntoView({ behavior: "smooth", block: "start" });
    celebrationFields.name.focus({ preventScroll: true });
  }

  celebrationForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!celebrationForm.reportValidity()) return;
    const original = celebrations.find((item) => item.id === editingCelebrationId);
    const celebration = normalizeCelebration({
      id: original?.id || uniqueId(),
      name: celebrationFields.name.value,
      kind: celebrationFields.kind.value,
      date: celebrationFields.date.value,
      notes: celebrationFields.notes.value,
    });
    if (!celebration) {
      showMessage("Confira a data comemorativa.", "error");
      return;
    }
    if (original) Object.assign(original, celebration);
    else celebrations.push(celebration);
    persist(STORAGE_KEYS.celebrations, celebrations);
    resetCelebrationForm();
    renderAll();
    showMessage(original ? "Data especial atualizada." : "Data especial cadastrada.");
  });

  function deleteCelebration(id) {
    const celebration = celebrations.find((item) => item.id === id);
    if (!celebration || !confirm(`Excluir "${celebration.name}"?`)) return;
    celebrations.splice(0, celebrations.length, ...celebrations.filter((item) => item.id !== id));
    if (editingCelebrationId === id) resetCelebrationForm();
    persist(STORAGE_KEYS.celebrations, celebrations);
    renderAll();
    showMessage("Data especial excluída.");
  }

  function nextCelebrationDate(celebration) {
    const currentYear = new Date().getFullYear();
    const year = yearlyDate(celebration, currentYear) < todayKey() ? currentYear + 1 : currentYear;
    return yearlyDate(celebration, year);
  }

  function renderCelebrations() {
    const target = $("#celebration-content");
    target.replaceChildren();
    if (!celebrations.length) {
      target.append(renderEmpty("Nenhuma data especial cadastrada."));
      return;
    }
    [...celebrations]
      .sort((a, b) => nextCelebrationDate(a).localeCompare(nextCelebrationDate(b)))
      .forEach((item) => {
        const row = element("article", "event-row");
        const info = element("div", "event-info");
        info.append(element("strong", "event-title", item.name));
        const nextDate = nextCelebrationDate(item);
        info.append(
          element(
            "p",
            "event-subtitle",
            `${KINDS[item.kind]} • Próxima ocorrência: ${formatDate(nextDate)}`,
          ),
        );
        if (item.notes) info.append(element("p", "event-note", item.notes));
        const actions = element("div", "item-actions");
        actions.append(
          actionButton(`Editar ${item.name}`, "pencil-square", () => editCelebration(item.id)),
        );
        actions.append(
          actionButton(
            `Excluir ${item.name}`,
            "trash3",
            () => deleteCelebration(item.id),
            "danger",
          ),
        );
        row.append(element("span", `legend-dot type-${item.kind}`), info, actions);
        target.append(row);
      });
  }

  return {
    renderAgenda,
    renderCelebrations,
    editMeeting,
    editCelebration,
    resetMeetingForm,
    resetCelebrationForm,
    meetingFields,
    meetingRow,
  };
}
