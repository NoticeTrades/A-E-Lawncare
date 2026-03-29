let languageMode = "en";
const messageTranslationCache = new Map();

const labels = {
  en: {
    noEntries: "No quote requests yet.",
    submitted: "Submitted",
    name: "Name",
    phone: "Phone",
    email: "Email",
    service: "Service",
    message: "Message",
    translateToSpanish: "Translate to Spanish",
    translateToEnglish: "Translate to English",
    translating: "Translating...",
    translationFailed: "Translation failed. Try again.",
    address: "Address",
    city: "City",
    state: "State",
    zip: "ZIP",
    customerType: "Customer"
  },
  es: {
    noEntries: "Aun no hay solicitudes de cotizacion.",
    submitted: "Enviado",
    name: "Nombre",
    phone: "Telefono",
    email: "Correo",
    service: "Servicio",
    message: "Mensaje",
    translateToSpanish: "Traducir a espanol",
    translateToEnglish: "Traducir a ingles",
    translating: "Traduciendo...",
    translationFailed: "La traduccion fallo. Intentalo de nuevo.",
    address: "Direccion",
    city: "Ciudad",
    state: "Estado",
    zip: "Codigo postal",
    customerType: "Cliente"
  }
};

function getQuotes() {
  return [];
}

function decodeHtmlEntities(str) {
  const decoded = String(str || "")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"');
  return decoded;
}

async function translateWithLibreTranslate(baseUrl, sourceText, targetLanguage) {
  const response = await fetch(`${baseUrl.replace(/\/$/, "")}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      q: sourceText,
      source: "auto",
      target: targetLanguage,
      format: "text"
    })
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const result = await response.json();
  return String(result?.translatedText || "").trim();
}

async function translateWithMyMemory(sourceText, targetLanguage) {
  const pair = targetLanguage === "es" ? "en|es" : "es|en";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(sourceText)}&langpair=${pair}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  const translated = String(data?.responseData?.translatedText || "").trim();
  if (!translated || translated.includes("MYMEMORY WARNING")) {
    throw new Error("Empty or rate-limited");
  }
  return translated;
}

async function translateWithLingva(sourceText, targetLanguage) {
  if (sourceText.length > 1800) {
    throw new Error("Text too long for Lingva GET");
  }
  const encoded = encodeURIComponent(sourceText);
  const url = `https://lingva.ml/api/v1/auto/${targetLanguage}/${encoded}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  const data = await response.json();
  const translated = String(data?.translation || "").trim();
  if (!translated) {
    throw new Error("Empty translation");
  }
  return translated;
}

async function translateMessage(rawText, targetLanguage) {
  const sourceText = decodeHtmlEntities(String(rawText || "")).trim();
  if (!sourceText) return "";

  const cacheKey = `${targetLanguage}::${sourceText}`;
  if (messageTranslationCache.has(cacheKey)) {
    return messageTranslationCache.get(cacheKey);
  }

  const libreBases = [
    "https://translate.argosopentech.com",
    "https://libretranslate.com",
    "https://libretranslate.de"
  ];

  let lastError = "";

  try {
    const out = await translateWithLingva(sourceText, targetLanguage);
    messageTranslationCache.set(cacheKey, out);
    return out;
  } catch (e) {
    lastError = e?.message || "Lingva";
  }

  for (const base of libreBases) {
    try {
      const out = await translateWithLibreTranslate(base, sourceText, targetLanguage);
      if (out) {
        messageTranslationCache.set(cacheKey, out);
        return out;
      }
    } catch (e) {
      lastError = `${base}: ${e?.message || e}`;
    }
  }

  try {
    const out = await translateWithMyMemory(sourceText, targetLanguage);
    messageTranslationCache.set(cacheKey, out);
    return out;
  } catch (e) {
    lastError = lastError ? `${lastError}; MyMemory: ${e?.message}` : e?.message;
  }

  throw new Error(lastError || "All translation providers failed");
}

function setAuthMessage(message) {
  const node = document.getElementById("admin-auth-status");
  if (node) node.textContent = message;
}

function setViewSignedIn(isSignedIn) {
  const authCard = document.getElementById("admin-auth-card");
  const dataWrap = document.getElementById("admin-data");
  if (!authCard || !dataWrap) return;
  authCard.classList.toggle("hidden", isSignedIn);
  dataWrap.classList.toggle("hidden", !isSignedIn);
}

async function loadQuotes() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setAuthMessage("Missing Supabase setup. Add keys in supabase-config.js.");
    return [];
  }

  const { data, error } = await supabase
    .from("quotes")
    .select(
      "id, created_at, name, phone, email, street_address, city, state, zip_code, customer_type, service, message"
    )
    .order("created_at", { ascending: false });

  if (error) {
    setAuthMessage(`Load failed: ${error.message}`);
    return [];
  }

  return data || [];
}

async function renderEntries() {
  const entriesNode = document.getElementById("entries");
  if (!entriesNode) return;

  const text = labels[languageMode];
  const quotes = await loadQuotes();

  if (!quotes.length) {
    entriesNode.innerHTML = `<div class="card"><p>${text.noEntries}</p></div>`;
    return;
  }

  const cards = quotes.map((quote) => {
    const when = new Date(quote.created_at).toLocaleString();
    const safeMessage = quote.message || "";
    const escapedMessage = safeMessage
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

    const addrLine = [quote.street_address, [quote.city, quote.state].filter(Boolean).join(", "), quote.zip_code]
      .filter(Boolean)
      .join(" · ");

    return `
      <article class="card quote-entry">
        <h3>${quote.name || "-"}</h3>
        <p><strong>${text.submitted}:</strong> ${when}</p>
        <p><strong>${text.email}:</strong> ${quote.email || "-"}</p>
        <p><strong>${text.phone}:</strong> ${quote.phone || "-"}</p>
        <p><strong>${text.address}:</strong> ${addrLine || "-"}</p>
        <p><strong>${text.customerType}:</strong> ${quote.customer_type || "-"}</p>
        <p><strong>${text.service}:</strong> ${quote.service || "-"}</p>
        <p><strong>${text.message}:</strong> <span class="message-text">${safeMessage || "-"}</span></p>
        <div class="dashboard-actions">
          <button
            class="btn btn-soft translate-btn"
            type="button"
            data-target-language="es"
            data-original-message="${escapedMessage}">
            ${text.translateToSpanish}
          </button>
          <button
            class="btn btn-soft translate-btn"
            type="button"
            data-target-language="en"
            data-original-message="${escapedMessage}">
            ${text.translateToEnglish}
          </button>
        </div>
      </article>
    `;
  });

  entriesNode.innerHTML = cards.join("");
}

document.getElementById("lang-en")?.addEventListener("click", async () => {
  languageMode = "en";
  await renderEntries();
});

document.getElementById("lang-es")?.addEventListener("click", async () => {
  languageMode = "es";
  await renderEntries();
});

document.getElementById("clear-all")?.addEventListener("click", async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  const ok = window.confirm("Clear all saved quote requests?");
  if (!ok) return;
  const { error } = await supabase.from("quotes").delete().neq("id", 0);
  if (error) {
    setAuthMessage(`Delete failed: ${error.message}`);
    return;
  }
  await renderEntries();
});

document.getElementById("entries")?.addEventListener("click", async (event) => {
  const button = event.target.closest(".translate-btn");
  if (!button) return;

  const targetLanguage = button.dataset.targetLanguage || "en";
  const originalMessage = button.dataset.originalMessage || "";
  const card = button.closest(".quote-entry");
  const messageNode = card?.querySelector(".message-text");
  if (!messageNode) return;

  const text = labels[languageMode];
  const priorText = button.textContent;

  try {
    button.disabled = true;
    button.textContent = text.translating;
    const translated = await translateMessage(originalMessage, targetLanguage);
    messageNode.textContent = translated;
  } catch (error) {
    messageNode.textContent = text.translationFailed;
  } finally {
    button.disabled = false;
    button.textContent = priorText;
  }
});

document.getElementById("logout")?.addEventListener("click", async () => {
  const supabase = getSupabaseClient();
  if (!supabase) return;
  await supabase.auth.signOut();
  setViewSignedIn(false);
  setAuthMessage("Signed out.");
});

document.getElementById("admin-login-form")?.addEventListener("submit", async (event) => {
  event.preventDefault();
  const supabase = getSupabaseClient();
  if (!supabase) {
    setAuthMessage("Missing Supabase setup. Add keys in supabase-config.js.");
    return;
  }

  const email = String(document.getElementById("admin-email")?.value || "").trim();
  const password = String(document.getElementById("admin-password")?.value || "");

  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    setAuthMessage(`Login failed: ${error.message}`);
    return;
  }

  setAuthMessage("");
  setViewSignedIn(true);
  await renderEntries();
});

async function initAdmin() {
  const supabase = getSupabaseClient();
  if (!supabase) {
    setAuthMessage("Missing Supabase setup. Add keys in supabase-config.js.");
    setViewSignedIn(false);
    return;
  }

  const { data } = await supabase.auth.getSession();
  const session = data?.session || null;
  if (session) {
    setViewSignedIn(true);
    await renderEntries();
    return;
  }
  setViewSignedIn(false);
}

initAdmin();
