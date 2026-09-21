import { useCallback, useRef, useState } from "react";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

export function useCopy(resetMs = 1600) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  const copy = useCallback(
    (text: string, id = "default") => {
      const done = () => {
        setCopied(id);
        if (timer.current) window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), resetMs);
      };
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => { setCopied(null); window.alert("Copy failed. Open the prompt and select its text to copy manually."); });
      } else {
        const ta = document.createElement("textarea");
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand("copy");
        } catch {
          /* ignore */
        }
        document.body.removeChild(ta);
        done();
      }
    },
    [resetMs],
  );

  return { copied, copy };
}

export function useLocalState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        localStorage.setItem(key, JSON.stringify(next));
      } catch {
        /* ignore */
      }
    },
    [key],
  );

  return [value, set] as const;
}

export function buildChainPrompt(
  title: string,
  target: string,
  steps: { pluginName: string; presetName: string }[],
) {
  const head = `Add this effect chain to my ${target} track in this order. Build each plugin from scratch, save it as a preset named after the preset in brackets, and set every Amount control to 0.0 so the chain is fully transparent until I push it.`;
  const body = steps
    .map((s, i) => `${i + 1}) ${s.pluginName} — [${s.presetName}]`)
    .join("\n");
  return `${title}\n\n${head}\n\n${body}\n\nAuto gain-match each stage so bypassing one stage does not change the level, and give every plugin a Listen-to-residual / delta button where it makes sense.`;
}
