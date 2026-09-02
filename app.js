// Koni-Notiz: Notiz direkt als Markdown-Datei ins GitHub-Repo radiuscountry/KoniVault ablegen.
const REPO = "radiuscountry/KoniVault";
const BRANCH = "master";

// Kategorie aus dem Dropdown -> Unterordner in der Inbox.
// Die Ordnernamen entsprechen den Top-Ordnern im Vault, damit die Inbox-Verarbeitung
// den Bereich mechanisch ableiten kann statt zu raten. Neue Kategorie = Eintrag hier
// und eine <option> in index.html; ohne Eintrag landet die Notiz direkt in Inbox/.
const INBOX_ORDNER = {
  "soH": "soH",
  "KMU": "KMU",
  "Privat": "Privat",
  "Wissen": "Wissen",
  "Tasks": "Tasks",
  "Fragen an Dani": "FragenDani",
};

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
  const kontext = kontextEl.value;
  const istTask = kontext === "Tasks";
  const unterordner = INBOX_ORDNER[kontext] ? `${INBOX_ORDNER[kontext]}/` : "";
  const path = `Inbox/${unterordner}${p.year}-${p.month}-${p.day}_${p.hour}${p.minute}_notiz.md`;

  let content = `# Notiz vom ${p.day}.${p.month}.${p.year} ${p.hour}:${p.minute}\n`;
  if (kontext) content += `Kontext: ${kontext}\n`;
  if (istTask) content += `Tags: #task\n`;
  content += "\n";
  content += istTask
    ? text.split("\n").filter((z) => z.trim()).map((z) => `- [ ] ${z.trim()}`).join("\n") + "\n"
    : `${text}\n`;

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

const fotoEl = document.getElementById("foto");
const fotoInputEl = document.getElementById("fotoInput");

fotoEl.addEventListener("click", () => fotoInputEl.click());

fotoInputEl.addEventListener("change", async () => {
  const file = fotoInputEl.files[0];
  fotoInputEl.value = "";
  if (!file) return;

  fotoEl.disabled = true;
  sendenEl.disabled = true;
  setStatus("Lese Notiz…", "");

  try {
    const { blob, mediaType } = await verkleinereBild(file);
    const bild = await blobToBase64(blob);

    const res = await fetch("/api/transkribieren", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ image: bild, mediaType }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setStatus(data.error || `Fehler beim Transkribieren (${res.status}).`, "err");
      return;
    }

    const erkannt = (data.text || "").trim();
    if (!erkannt) { setStatus("Kein Text erkannt.", "err"); return; }

    let neu = erkannt;
    if (istMindmap(erkannt)) neu += `\n\n${mindmapZuMermaid(erkannt)}`;

    textEl.value = textEl.value.trim() ? `${textEl.value.trim()}\n\n${neu}` : neu;
    setStatus("Notiz eingelesen ✓", "ok");
  } catch (e) {
    setStatus("Kein Netz oder Foto konnte nicht verarbeitet werden. Textfeld unveraendert.", "err");
  } finally {
    fotoEl.disabled = false;
    sendenEl.disabled = false;
  }
});

function verkleinereBild(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const maxKante = 1600;
      const skala = Math.min(1, maxKante / Math.max(img.width, img.height));
      const breite = Math.round(img.width * skala);
      const hoehe = Math.round(img.height * skala);

      const canvas = document.createElement("canvas");
      canvas.width = breite;
      canvas.height = hoehe;
      canvas.getContext("2d").drawImage(img, 0, 0, breite, hoehe);

      canvas.toBlob((blob) => {
        if (!blob) { reject(new Error("Bild konnte nicht verarbeitet werden.")); return; }
        console.log(`Bild verkleinert: ${file.size} -> ${blob.size} Bytes (${breite}x${hoehe})`);
        resolve({ blob, mediaType: "image/jpeg" });
      }, "image/jpeg", 0.8);
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Bild konnte nicht geladen werden.")); };
    img.src = url;
  });
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result.split(",")[1]);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function istMindmap(text) {
  const zeilen = text.split("\n");
  const hatUeberschrift = /^#\s+/.test(zeilen[0] || "");
  const hatEinrueckung = zeilen.some((z) => /^\t+[-*]\s+/.test(z));
  return hatUeberschrift && hatEinrueckung;
}

function mindmapZuMermaid(text) {
  const zeilen = text.split("\n").filter((z) => z.trim() && !z.trim().startsWith("→") && !z.trim().startsWith("->"));
  const titel = (zeilen[0] || "").replace(/^#\s+/, "").trim();
  const ausgabe = ["mindmap", `  root((${titel}))`];

  for (const zeile of zeilen.slice(1)) {
    const treffer = zeile.match(/^(\t*)[-*]\s+(.*)$/);
    if (!treffer) continue;
    const ebene = treffer[1].length;
    const inhalt = treffer[2].trim();
    if (!inhalt) continue;
    ausgabe.push("  ".repeat(ebene + 2) + inhalt);
  }

  return "```mermaid\n" + ausgabe.join("\n") + "\n```";
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js");
}
