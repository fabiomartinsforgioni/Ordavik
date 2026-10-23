export const $ = (selector) => document.querySelector(selector);
export const $$ = (selector) => [...document.querySelectorAll(selector)];
export function element(tag, className = "", text = "") {
  const node = document.createElement(tag);
  node.className = className;
  node.textContent = text;
  return node;
}
export function actionButton(label, icon, callback, variant = "secondary", key = label) {
  const button = element(
    "button",
    `icon-button action-${variant}`,
    { "pencil-square": "✎", trash3: "×" }[icon] || icon,
  );
  button.type = "button";
  button.title = label;
  button.setAttribute("aria-label", label);
  button.dataset.uiKey = `action:${key}`;
  button.addEventListener("click", callback);
  return button;
}
export function renderEmpty(text) {
  return element("p", "muted-empty", text);
}

/** Mantém painéis e foco por chave estável quando a lista precisa ser redesenhada. */
export function replacePreservingState(container, nodes) {
  const openKeys = new Set(
    [...container.querySelectorAll("details[open][data-ui-key]")].map((node) => node.dataset.uiKey),
  );
  const focused = document.activeElement;
  const focusKey = container.contains(focused) ? focused.dataset.uiKey : null;
  container.replaceChildren(...nodes);
  for (const node of container.querySelectorAll("[data-ui-key]")) {
    if (node.tagName === "DETAILS" && openKeys.has(node.dataset.uiKey)) node.open = true;
    if (focusKey && node.dataset.uiKey === focusKey) node.focus({ preventScroll: true });
  }
}

let timer;
export function notify(text, kind = "success", undo) {
  const box = $("#app-message");
  clearTimeout(timer);
  box.replaceChildren(element("span", "", text));
  box.dataset.kind = kind;
  box.hidden = false;
  if (undo) {
    const button = element("button", "btn btn-sm btn-outline-secondary", "Desfazer");
    button.type = "button";
    button.addEventListener(
      "click",
      () => {
        undo();
        box.hidden = true;
      },
      { once: true },
    );
    box.append(button);
  }
  const close = element("button", "icon-button", "×");
  close.type = "button";
  close.setAttribute("aria-label", "Fechar mensagem");
  close.addEventListener("click", () => {
    box.hidden = true;
  });
  box.append(close);
  if (!undo && kind !== "error")
    timer = setTimeout(() => {
      box.hidden = true;
    }, 6000);
}
