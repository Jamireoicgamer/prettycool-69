import { useEffect, useState } from "react";
import { RunwareService } from "@/services/RunwareService";

// Small helper hook to lazily generate and cache an image per key.
// Uses localStorage cache: `combatImage:{key}` -> { url, prompt }
export function useCombatImage(key: string, prompt: string) {
  const [url, setUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cacheKey = `combatImage:${key}`;

    const fromCache = () => {
      try {
        const raw = localStorage.getItem(cacheKey);
        if (raw) {
          const data = JSON.parse(raw);
          return data?.url as string | null;
        }
      } catch {}
      return null;
    };

    const existing = fromCache();
    if (existing) {
      setUrl(existing);
      return;
    }

    // Only attempt generation if API key exists
    const apiKey = (() => {
      try { return localStorage.getItem("runwareApiKey"); } catch { return null; }
    })();

    if (!apiKey) {
      // No key; skip generation and leave null to allow UI fallback
      return;
    }

    setLoading(true);
    const service = RunwareService.getInstance();
    service.setApiKey(apiKey);

    service.generateImage({ positivePrompt: prompt, numberResults: 1, outputFormat: "WEBP" })
      .then((res) => {
        if (cancelled) return;
        const imageURL = (res as any).imageURL || (res as any).data?.[0]?.imageURL;
        if (imageURL) {
          setUrl(imageURL);
          try { localStorage.setItem(cacheKey, JSON.stringify({ url: imageURL, prompt })); } catch {}
        } else {
          setError("No image URL returned");
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setError(e?.message || "Generation failed");
      })
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [key, prompt]);

  return { url, loading, error } as const;
}
