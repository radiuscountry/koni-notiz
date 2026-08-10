// Koni-Notiz: Notiz direkt als Markdown-Datei ins GitHub-Repo radiuscountry/KoniVault ablegen.
const REPO = "radiuscountry/KoniVault";
const BRANCH = "master";

const textEl = document.getElementById("text");
const kontextEl = document.getElementById("kontext");
const sendenEl = document.getElementById("senden");
const statusEl = document.getElementById("status");
const settingsEl = document.getElementById("settings");
const tokenInputEl = document.getElementById("token");

document.getElementById("gear").addEventListener("click", () => {
  tokenInputEl.value = localStorage.getItem("gh_token") || "";
  settingsEl.showModal();
});
document.getElementById("close").addEventListener("click", () => settingsEl.close());
document.getElementById("save").addEventListener("click", () => {
  localStorage.setItem("gh_token", tokenInputEl.value.replace(/\s+/g, ""));
  settingsEl.close();
});

function zurichParts() {
  const fmt = new Intl.DateTimeFormat("de-CH", {
    timeZone: "Europe/Zurich",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  });
  const p = Object.fromEntries(fmt.formatToParts(new Date()).map(x => [x.type, x.value]));
  return p; // {year, month, day, hour, minute}
}

function base64Utf8(str) {
  return btoa(String.fromCharCode(...new TextEncoder().encode(str)));
}

function setStatus(msg, kind) {
  statusEl.textContent = msg;
  statusEl.className = kind || "";
}

sendenEl.addEventListener("click", async () => {
  const text = textEl.value.trim();
  if (!text) { setStatus("Notiz ist leer.", "err"); return; }

  const token = localStorage.getItem("gh_token");
  if (!token) { setStatus("Kein Token hinterlegt. Zahnrad oben rechts.", "err"); return; }

  const p = zurichParts();
  const path = `Inbox/${p.year}-${p.month}-${p.day}_${p.hour}${p.minute}_notiz.md`;
  const kontext = kontextEl.value;

  let content = `# Notiz vom ${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}\n`;
  if (kontext) content += `Kontext: ${kontext}\n`;
  content += `\n${text}\n`;

  sendenEl.disabled = true;
  setStatus("Wird gesendet...", "");

  const url = `https://api.github.com/repos/${REPO}/contents/${path}`;

  try {
    const res = await fetch(
      url,
      {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/vnd.github+json",
        },
        body: JSON.stringify({
          message: "Notiz via App",
          content: base64Utf8(content),
          branch: BRANCH,
        }),
      }
    );

    if (res.ok) {
      textEl.value = "";
      kontextEl.value = "";
      setStatus("Gesendet ✓", "ok");
    } else if (res.status === 401) {
      setStatus("Token ungueltig oder abgelaufen. Im Zahnrad pruefen.", "err");
    } else if (res.status === 404) {
      setStatus(`404 bei ${url} - Repo/Branch/Pfad oder Token-Berechtigung pruefen.`, "err");
    } else {
      const body = await res.json().catch(() => ({}));
      setStatus(`Fehler ${res.status}: ${body.message || "unbekannt"}`, "err");
    }
  } catch (e) {
    setStatus("Kein Netz oder Verbindung fehlgeschlagen. Text bleibt erhalten.", "err");
  } finally {
    sendenEl.disabled = false;
  }
});

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
