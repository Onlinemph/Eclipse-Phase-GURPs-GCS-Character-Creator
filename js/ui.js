// Small DOM helpers. No framework: the wizard is a dozen forms and a table.

/** el("div.card", {onclick}, "text", childNode, ...) */
export function el(spec, props = null, ...children) {
  const [tag, ...classes] = String(spec).split(".");
  const node = document.createElement(tag || "div");
  if (classes.length) node.className = classes.join(" ");
  if (props && (typeof props !== "object" || props instanceof Node || Array.isArray(props))) {
    children.unshift(props);
  } else if (props) {
    for (const [key, value] of Object.entries(props)) {
      if (value === null || value === undefined || value === false) continue;
      if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.slice(2).toLowerCase(), value);
      } else if (key === "dataset") {
        Object.assign(node.dataset, value);
      } else if (key === "html") {
        node.innerHTML = value;
      } else if (key in node && key !== "list" && key !== "form") {
        node[key] = value;
      } else {
        node.setAttribute(key, value === true ? "" : value);
      }
    }
  }
  append(node, children);
  return node;
}

function append(node, children) {
  for (const child of children) {
    if (child === null || child === undefined || child === false) continue;
    if (Array.isArray(child)) append(node, child);
    else node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
}

export const clear = (node) => {
  while (node.firstChild) node.firstChild.remove();
  return node;
};

/** A labelled form field. */
export function field(label, control, hint = "") {
  return el("label.field", el("span.field-label", label), control,
    hint ? el("span.field-hint", hint) : null);
}

export function textInput(value, onInput, attrs = {}) {
  return el("input", { type: "text", value: value ?? "", oninput: (e) => onInput(e.target.value), ...attrs });
}

export function numberInput(value, onInput, attrs = {}) {
  return el("input", {
    type: "number",
    value: value ?? 0,
    oninput: (e) => onInput(e.target.value === "" ? null : Number(e.target.value)),
    ...attrs,
  });
}

export function select(options, value, onChange, attrs = {}) {
  const node = el("select", {
    onchange: (e) => onChange(e.target.value),
    ...attrs,
  },
    options.map((o) =>
      el("option", { value: o.value, selected: String(o.value) === String(value) }, o.label),
    ),
  );
  return node;
}

export function checkbox(label, checked, onChange) {
  return el("label.check",
    el("input", { type: "checkbox", checked: Boolean(checked), onchange: (e) => onChange(e.target.checked) }),
    el("span", label),
  );
}

export function button(label, onClick, variant = "") {
  return el(`button${variant ? "." + variant : ""}`, { type: "button", onclick: onClick }, label);
}

/** A collapsible section, closed by default. */
export function details(summary, ...children) {
  return el("details.disclosure", el("summary", summary), ...children);
}

export const money = (n) => `$${Number(n || 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`;

export const points = (n) => `${n > 0 ? "+" : ""}${n} pt${Math.abs(n) === 1 ? "" : "s"}`;

/** A search box that filters a list on each keystroke. */
export function filterBox(placeholder, onFilter) {
  return el("input.filter", {
    type: "search",
    placeholder,
    oninput: (e) => onFilter(e.target.value.trim().toLowerCase()),
  });
}

/** Highlight-free plain text match across several fields. */
export function matches(query, ...fields) {
  if (!query) return true;
  const haystack = fields.filter(Boolean).join(" ").toLowerCase();
  return query.split(/\s+/).every((word) => haystack.includes(word));
}

export function notice(level, ...children) {
  return el(`p.notice.${level}`, ...children);
}

/** Trigger a browser download for generated text. */
export function download(filename, text, type = "application/json") {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const link = el("a", { href: url, download: filename });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/** Read a user-selected file as text. */
export function readFile(accept) {
  return new Promise((resolve, reject) => {
    const input = el("input", { type: "file", accept });
    input.addEventListener("change", () => {
      const file = input.files?.[0];
      if (!file) return resolve(null);
      file.text().then(resolve, reject);
    });
    input.click();
  });
}
