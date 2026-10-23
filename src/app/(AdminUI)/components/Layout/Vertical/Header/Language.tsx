import React, { useEffect, useRef } from "react";
import { useSelector } from "@/store/hooks";
import { AppState } from "@/store/store";
import { Box, useTheme } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { translateWithSnapshot } from "@/utils/languageTransition";
import "@/app/(AdminUI)/components/Layout/Vertical/Header/Language.css";

declare global {
  interface Window {
    gtranslateSettings: any;
  }
}

const WIDGET_ID = "fas-language-widget";
const PARKING_ID = "fas-language-parking";
const SCRIPT_URL = "https://cdn.gtranslate.net/widgets/latest/globe.js";

// globe.js registers load_tlib(callback) directly as a pointerenter/focusin
// listener. It then treats the Event as a callable callback and throws.
// Block only these prefetch events inside our vendor-owned widget. Selecting a
// language still loads the library through doGTranslate's valid callback path.
const preventBrokenPrefetch = (event: Event) => event.stopImmediatePropagation();

const handleLanguageSelection = (event: Event) => {
  const widget = event.currentTarget as HTMLElement;
  const link = event.target instanceof Element ? event.target.closest("a[data-gt-lang]") : null;
  const language = link?.getAttribute("data-gt-lang");
  if (!language || !link || !widget.contains(link)) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  // Close the globe without invoking its immediate translation handler.
  document.dispatchEvent(new MouseEvent("click"));
  void translateWithSnapshot(language, widget).catch((error: Error) => {
    enqueueSnackbar(error.message, { variant: "error" });
  });
};

const Language = () => {
  const customizer = useSelector((state: AppState) => state.customizer);
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeColor = customizer.activeMode === "dark"
    ? theme.palette.primary.dark
    : theme.palette.primary.main;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // GTranslate appends markup and document listeners on every execution and
    // has no destroy API. Keep one widget (including its listeners) per page.
    let widget = document.getElementById(WIDGET_ID);
    if (!widget) {
      widget = document.createElement("div");
      widget.id = WIDGET_ID;
      widget.className = "gtranslate_wrapper";
      widget.addEventListener("pointerenter", preventBrokenPrefetch, true);
      widget.addEventListener("focusin", preventBrokenPrefetch, true);
      widget.addEventListener("click", handleLanguageSelection, true);
      Object.assign(widget.style, {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
    }
    container.appendChild(widget);

    if (!document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      window.gtranslateSettings = {
        default_language: "tr",
        languages: ["tr", "en", "de", "fr", "az", "ar", "sq"],
        globe_color: globeColor,
        wrapper_selector: `#${WIDGET_ID}`,
        flag_size: 16,
        globe_size: 20,
        float_position: "center",
      };

      const script = document.createElement("script");
      script.src = SCRIPT_URL;
      script.defer = true;
      // Allow a later mount to retry a failed download.
      script.onerror = () => script.remove();
      document.body.appendChild(script);
    }

    return () => {
      if (widget.parentNode !== container) return;
      // Keep the selector reachable even if the download finishes after unmount.
      // Reattach the same DOM on remount instead of executing globe.js again.
      let parking = document.getElementById(PARKING_ID);
      if (!parking) {
        parking = document.createElement("div");
        parking.id = PARKING_ID;
        parking.hidden = true;
        document.body.appendChild(parking);
      }
      parking.appendChild(widget);
    };
  }, [globeColor]);

  return <Box padding={2}><div ref={containerRef} /></Box>;
};

export default Language;
