// Keep the copy outside the translation engine and application DOM selectors.
// Shadow DOM also lets SVG references and IDs keep working without duplicates.
export function freezeLanguageView(language?: string): () => void {
  const cover = document.createElement("div");
  cover.id = "fas-language-snapshot";
  cover.className = "notranslate";
  cover.setAttribute("translate", "no");
  cover.setAttribute("role", "status");
  cover.setAttribute("aria-label", "Dil değiştiriliyor");
  cover.setAttribute("aria-busy", "true");
  cover.tabIndex = -1;
  Object.assign(cover.style, {
    position: "fixed", inset: "0", zIndex: "2147483647", overflow: "hidden",
    background: getComputedStyle(document.body).backgroundColor === "rgba(0, 0, 0, 0)"
      ? "#fff" : getComputedStyle(document.body).backgroundColor,
    cursor: "default",
  });
  const shadow = cover.attachShadow({ mode: "open" });
  const html = document.documentElement.cloneNode(false) as HTMLElement;
  const body = document.body.cloneNode(true) as HTMLBodyElement;
  html.appendChild(body);
  html.setAttribute("aria-hidden", "true");
  html.inert = true;
  Object.assign(html.style, {
    position: "absolute", top: `${-window.scrollY}px`, left: `${-window.scrollX}px`,
    width: `${document.documentElement.clientWidth || window.innerWidth}px`, margin: "0",
  });

  // Emotion/MUI can insert CSS via CSSOM, leaving style.textContent empty.
  Array.from(document.styleSheets).forEach((sheet) => {
    try {
      const style = document.createElement("style");
      style.textContent = Array.from(sheet.cssRules, (rule) => rule.cssText).join("\n");
      if (sheet.media.mediaText) style.media = sheet.media.mediaText;
      if (!sheet.disabled) shadow.appendChild(style);
    } catch {
      // Cross-origin CSS cannot be read; reuse its already cached stylesheet.
      if (sheet.ownerNode) shadow.appendChild(sheet.ownerNode.cloneNode(true));
    }
  });

  const originals = Array.from(document.body.querySelectorAll("*"));
  const copies = Array.from(body.querySelectorAll("*"));
  const positioned: Array<[HTMLElement, DOMRect]> = [];
  originals.forEach((original, index) => {
    const copy = copies[index];
    if (original instanceof HTMLInputElement && copy instanceof HTMLInputElement) {
      copy.value = original.value;
      copy.checked = original.checked;
    } else if (original instanceof HTMLTextAreaElement && copy instanceof HTMLTextAreaElement) {
      copy.value = original.value;
    } else if (original instanceof HTMLSelectElement && copy instanceof HTMLSelectElement) {
      copy.selectedIndex = original.selectedIndex;
    } else if (original instanceof HTMLCanvasElement && copy instanceof HTMLCanvasElement) {
      try { copy.getContext("2d")?.drawImage(original, 0, 0); } catch { /* Keep the remaining snapshot. */ }
    }
    if (original instanceof HTMLElement && copy instanceof HTMLElement) {
      const position = getComputedStyle(original).position;
      if (position === "sticky" || position === "fixed") positioned.push([copy, original.getBoundingClientRect()]);
    }
  });
  body.querySelectorAll("script, iframe, nextjs-portal").forEach((node) => node.remove());
  shadow.appendChild(html);
  if (language) {
    const flag = Array.from(body.querySelectorAll<HTMLElement>("a[data-gt-lang]"))
      .find((link) => link.getAttribute("data-gt-lang") === language);
    if (flag) {
      const spinner = document.createElement("span");
      spinner.setAttribute("data-language-loading", language);
      Object.assign(spinner.style, {
        position: "absolute", inset: "-3px", border: "2px solid #fff",
        borderTopColor: "#2196f3", borderRightColor: "#2196f3", borderRadius: "50%",
        animation: "fas-language-spin .7s linear infinite", boxSizing: "border-box",
      });
      const style = document.createElement("style");
      style.textContent = "@keyframes fas-language-spin{to{transform:rotate(360deg)}}";
      shadow.appendChild(style);
      flag.style.display = "inline-block";
      flag.setAttribute("aria-busy", "true");
      flag.appendChild(spinner);
    }
  }
  const focus = document.activeElement;
  document.body.appendChild(cover);
  originals.forEach((original, index) => {
    copies[index].scrollTop = original.scrollTop;
    copies[index].scrollLeft = original.scrollLeft;
  });
  // Sticky/fixed headers must retain their viewport position on scrolled pages.
  positioned.forEach(([copy, rect]) => {
    const clonedRect = copy.getBoundingClientRect();
    copy.style.translate = `${rect.left - clonedRect.left}px ${rect.top - clonedRect.top}px`;
  });
  cover.focus({ preventScroll: true });
  const block = (event: Event) => { event.preventDefault(); event.stopImmediatePropagation(); };
  cover.addEventListener("wheel", block, { passive: false });
  cover.addEventListener("touchmove", block, { passive: false });
  document.addEventListener("keydown", block, true);

  return () => {
    document.removeEventListener("keydown", block, true);
    cover.remove();
    if (focus instanceof HTMLElement && focus.isConnected) focus.focus({ preventScroll: true });
  };
}
