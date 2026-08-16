// Transkribiert ein Foto einer handschriftlichen Notiz via Claude-API.
// Erwartet POST { image: base64, mediaType: "image/jpeg" }, liefert { text: "..." }.

const SYSTEM_PROMPT = `Du transkribierst ein Foto einer handschriftlichen Notiz.

Schritt 1 - Transkription: Alle Textelemente wortgetreu transkribieren.
Zeilenumbrueche erhalten. Unleserliches als [?] markieren. Nichts erfinden
oder interpretieren.

Schritt 2 - Notiztyp erkennen und passend ausgeben:
- Lineare Notiz (Fliesstext oder Liste): so ausgeben wie geschrieben.
- Mindmap/Skizze mit Verbindungslinien: als hierarchische Markdown-Liste.
  Zentrum = "# Ueberschrift". Aeste = eingerueckte Aufzaehlungspunkte mit
  Tab-Einrueckung (ein Tab pro Ebene, Punkte beginnen mit "- ").
  Querverbindungen zwischen Aesten als separate Zeile am Schluss im Format
  "-> Verbindung: A <-> B".
- Unsichere Zuordnungen mit [?] markieren.

Gib ausschliesslich den reinen Markdown-Text der Transkription zurueck, ohne
Einleitung, Erklaerung oder Kommentar.`;

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Nur POST erlaubt." });
    return;
  }

  const { image, mediaType } = req.body || {};
  if (!image || typeof image !== "string") {
    res.status(400).json({ error: "Kein Bild erhalten." });
    return;
  }
  if (!mediaType || typeof mediaType !== "string" || !mediaType.startsWith("image/")) {
    res.status(400).json({ error: "Ungueltiger Bildtyp." });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    res.status(500).json({ error: "Server nicht konfiguriert (kein API-Key)." });
    return;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 45000);

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 2000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              { type: "text", text: "Transkribiere diese handschriftliche Notiz." },
            ],
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!anthropicRes.ok) {
      const body = await anthropicRes.json().catch(() => ({}));
      const detail = body.error?.message || `HTTP ${anthropicRes.status}`;
      res.status(502).json({ error: `Claude-API-Fehler: ${detail}` });
      return;
    }

    const data = await anthropicRes.json();
    const text = (data.content || []).map((b) => b.text || "").join("").trim();

    if (!text) {
      res.status(502).json({ error: "Claude hat keinen Text geliefert." });
      return;
    }

    res.status(200).json({ text });
  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === "AbortError") {
      res.status(504).json({ error: "Zeitueberschreitung beim Transkribieren. Bitte erneut versuchen." });
      return;
    }
    res.status(500).json({ error: "Unerwarteter Fehler beim Transkribieren." });
  }
}
