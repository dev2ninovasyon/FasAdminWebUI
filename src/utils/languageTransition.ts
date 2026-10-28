import { freezeLanguageView } from "./freezeLanguageView";

interface Translator {
  libReady: boolean;
  finished: boolean;
  error: boolean;
  translate(source: string, target: string): boolean;
}

declare global {
  interface Window {
    __GT?: { translator?: Translator };
    gt_translate_script?: HTMLScriptElement;
  }
}

let activeTransition: Promise<void> | null = null;

function waitUntil(predicate: () => boolean, deadline: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) resolve();
      else if (Date.now() >= deadline) reject(new Error("Dil değişimi zaman aşımına uğradı. Lütfen tekrar deneyin."));
      else window.setTimeout(check, 50);
    };
    check();
  });
}

async function runTransition(language: string, widget: HTMLElement): Promise<void> {
  const release = freezeLanguageView(language);
  const deadline = Date.now() + 30000;
  let lastMutation = Date.now();
  const observer = new MutationObserver((records) => {
    if (records.some((record) => !(record.target instanceof Element
      ? record.target.closest('#fas-language-snapshot')
      : record.target.parentElement?.closest('#fas-language-snapshot')))) {
      lastMutation = Date.now();
    }
  });
  observer.observe(document.documentElement, {
    subtree: true, childList: true, characterData: true,
    attributes: true, attributeFilter: ["lang", "dir", "class"],
  });
  try {
    // Paint the old language before the translator restores the Turkish source.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    if (!window.__GT?.translator && !window.gt_translate_script) {
      const script = document.createElement("script");
      script.src = "https://cdn.gtranslate.net/widgets/latest/lib.min.js";
      window.gt_translate_script = script;
      await new Promise<void>((resolve, reject) => {
        const fail = () => {
          window.clearTimeout(timeout);
          script.remove();
          delete window.gt_translate_script;
          reject(new Error("Çeviri servisine ulaşılamadı. Lütfen tekrar deneyin."));
        };
        const timeout = window.setTimeout(fail, Math.max(0, deadline - Date.now()));
        script.onload = () => { window.clearTimeout(timeout); resolve(); };
        script.onerror = fail;
        document.body.appendChild(script);
      });
    }
    await waitUntil(() => !!window.__GT?.translator?.libReady, deadline);
    const translator = window.__GT!.translator!;
    if (!translator.translate("tr", language)) throw new Error("Dil değiştirilemedi. Lütfen tekrar deneyin.");
    if (language !== "tr") {
      await waitUntil(() => translator.finished || translator.error, deadline);
      if (translator.error) throw new Error("Çeviri tamamlanamadı. Lütfen tekrar deneyin.");
    }
    // The engine can report completion before its queued DOM updates have
    // painted. Keep the old view until the live content has also settled.
    lastMutation = Date.now();
    await waitUntil(() => (language === "tr" || translator.finished)
      && (language === "tr" || document.documentElement.lang === language)
      && Date.now() - lastMutation >= 350, deadline);
    if (language !== "tr" && translator.error) throw new Error("Çeviri tamamlanamadı. Lütfen tekrar deneyin.");
    widget.querySelectorAll("a[data-gt-lang]").forEach((link) => {
      link.classList.toggle("gt-current-lang", link.getAttribute("data-gt-lang") === language);
    });
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  } finally {
    observer.disconnect();
    release();
  }
}

export function translateWithSnapshot(language: string, widget: HTMLElement): Promise<void> {
  if (!activeTransition) {
    activeTransition = runTransition(language, widget).finally(() => { activeTransition = null; });
  }
  return activeTransition;
}
