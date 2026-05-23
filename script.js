/* =============================================
   ATLAS BARBER — script.js
   Atlas Valley Ecosystem | by panthera_leo & elf_wizard
   ============================================= */

// ============================================
// ⚙️  CONFIGURAZIONE — COMPILA QUESTI CAMPI
// ============================================

const CONFIG = {
  // Discord Webhook per BOOKING IN LOCALE
  // Incolla il tuo webhook URL qui:
  BOOKING_WEBHOOK_URL: "INSERIRE_WEBHOOK_DISCORD_BOOKING",

  // Discord Webhook per SERVIZIO A DOMICILIO
  // Può essere lo stesso canale o uno dedicato:
  DOMICILIO_WEBHOOK_URL: "INSERIRE_WEBHOOK_DISCORD_DOMICILIO",

  // Indirizzo del locale (sostituisce i placeholder nel sito)
  INDIRIZZO_LOCALE: "INSERIRE INDIRIZZO DEL LOCALE",

  // Link Google Maps del locale
  GOOGLE_MAPS_URL: "https://maps.google.com/?q=INSERIRE+INDIRIZZO"
};

// ============================================
// INIT
// ============================================

document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initNavbar();
  initMobileMenu();
  initScrollReveal();
  initDateInputs();
  initBookingForm();
  initDomicilioForm();
});

// ============================================
// APPLY CONFIG — popola indirizzi e links
// ============================================

function applyConfig() {
  // Indirizzo drop-in
  const addrEl = document.getElementById("dropin-address");
  if (addrEl && CONFIG.INDIRIZZO_LOCALE !== "INSERIRE INDIRIZZO DEL LOCALE") {
    addrEl.textContent = CONFIG.INDIRIZZO_LOCALE;
  }

  // Indirizzo nella sezione contatti
  const contactAddr = document.getElementById("contact-address");
  if (contactAddr && CONFIG.INDIRIZZO_LOCALE !== "INSERIRE INDIRIZZO DEL LOCALE") {
    contactAddr.textContent = CONFIG.INDIRIZZO_LOCALE;
  }

  // Link Google Maps
  const mapsLink = document.getElementById("maps-link");
  if (mapsLink && CONFIG.GOOGLE_MAPS_URL !== "https://maps.google.com/?q=INSERIRE+INDIRIZZO") {
    mapsLink.href = CONFIG.GOOGLE_MAPS_URL;
  }
}

// ============================================
// NAVBAR — scroll effect
// ============================================

function initNavbar() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 60) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// ============================================
// MOBILE MENU
// ============================================

function initMobileMenu() {
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("mobileMenu");

  toggle.addEventListener("click", () => {
    menu.classList.toggle("open");
  });
}

function closeMobile() {
  document.getElementById("mobileMenu").classList.remove("open");
}

window.closeMobile = closeMobile;

// ============================================
// SCROLL REVEAL
// ============================================

function initScrollReveal() {
  const targets = document.querySelectorAll(
    ".service-card, .contact-card, .dd-item, .about-text, .about-visual, .dropin-info, .dropin-map-box, .form-container, .df-item"
  );

  targets.forEach(el => el.classList.add("reveal"));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay ? parseInt(entry.target.dataset.delay) * 80 : 0;
        setTimeout(() => {
          entry.target.classList.add("visible");
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  targets.forEach(el => observer.observe(el));
}

// ============================================
// DATE INPUTS — imposta la data minima a oggi
// ============================================

function initDateInputs() {
  const today = new Date().toISOString().split("T")[0];
  document.querySelectorAll('input[type="date"]').forEach(input => {
    input.min = today;
  });
}

// ============================================
// DISCORD WEBHOOK SENDER
// ============================================

async function sendToDiscord(webhookUrl, embed) {
  if (!webhookUrl || webhookUrl.startsWith("INSERIRE")) {
    console.warn("⚠️ Webhook Discord non configurato. Imposta CONFIG nel file script.js");
    return { ok: false, error: "webhook_not_configured" };
  }

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ embeds: [embed] })
    });

    return { ok: response.ok, status: response.status };
  } catch (err) {
    console.error("Errore invio Discord:", err);
    return { ok: false, error: err.message };
  }
}

// ============================================
// BOOKING FORM — Prenotazione in Locale
// ============================================

function initBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("bookingSubmitBtn");
    const status = document.getElementById("booking-status");

    setButtonLoading(btn, true);
    hideStatus(status);

    const data = {
      name:    form.querySelector("#b-name").value.trim(),
      phone:   form.querySelector("#b-phone").value.trim(),
      email:   form.querySelector("#b-email").value.trim(),
      service: form.querySelector("#b-service").value,
      date:    form.querySelector("#b-date").value,
      time:    form.querySelector("#b-time").value,
      barber:  form.querySelector("#b-barber").value,
      notes:   form.querySelector("#b-notes").value.trim()
    };

    const embed = buildBookingEmbed(data);
    const result = await sendToDiscord(CONFIG.BOOKING_WEBHOOK_URL, embed);

    setButtonLoading(btn, false);

    if (result.ok) {
      showStatus(status, "success",
        "✅ Prenotazione inviata! Il team Atlas Barber ti contatterà a breve per conferma.");
      form.reset();
    } else if (result.error === "webhook_not_configured") {
      showStatus(status, "error",
        "⚠️ Webhook non configurato. Contatta il team per configurare lo script.");
    } else {
      showStatus(status, "error",
        "❌ Errore nell'invio. Prova a contattarci direttamente via telefono o email.");
    }
  });
}

function buildBookingEmbed(data) {
  const dateFormatted = data.date
    ? new Date(data.date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "—";

  return {
    title: "📅 NUOVA PRENOTAZIONE — Atlas Barber",
    color: 0xC9A84C,
    thumbnail: { url: "https://pantheraleo-atlasvalley.github.io/resources/images/logo.jpg" },
    fields: [
      { name: "👤 Cliente",    value: data.name || "—",          inline: true },
      { name: "📞 Telefono",   value: data.phone || "—",         inline: true },
      { name: "📧 Email",      value: data.email || "—",         inline: true },
      { name: "✂️ Servizio",   value: data.service || "—",       inline: true },
      { name: "📅 Data",       value: dateFormatted,             inline: true },
      { name: "🕐 Orario",     value: data.time || "—",          inline: true },
      { name: "💈 Barbiere",   value: data.barber || "—",        inline: true },
      { name: "📝 Note",       value: data.notes || "Nessuna nota", inline: false }
    ],
    footer: {
      text: "⚡ Atlas Barber · Atlas Valley Ecosystem",
      icon_url: "https://pantheraleo-atlasvalley.github.io/resources/images/logo.jpg"
    },
    timestamp: new Date().toISOString()
  };
}

// ============================================
// DOMICILIO FORM — Servizio a Domicilio
// ============================================

function initDomicilioForm() {
  const form = document.getElementById("domicilioForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const btn = document.getElementById("domicilioSubmitBtn");
    const status = document.getElementById("domicilio-status");

    setButtonLoading(btn, true);
    hideStatus(status);

    const data = {
      name:          form.querySelector("#d-name").value.trim(),
      phone:         form.querySelector("#d-phone").value.trim(),
      email:         form.querySelector("#d-email").value.trim(),
      service:       form.querySelector("#d-service").value,
      address:       form.querySelector("#d-address").value.trim(),
      date:          form.querySelector("#d-date").value,
      time:          form.querySelector("#d-time").value,
      people:        form.querySelector("#d-people").value,
      location_type: form.querySelector("#d-location-type").value,
      notes:         form.querySelector("#d-notes").value.trim()
    };

    const embed = buildDomicilioEmbed(data);
    const result = await sendToDiscord(CONFIG.DOMICILIO_WEBHOOK_URL, embed);

    setButtonLoading(btn, false);

    if (result.ok) {
      showStatus(status, "success",
        "✅ Richiesta inviata! Il team Atlas Barber ti contatterà presto per confermare disponibilità e dettagli.");
      form.reset();
    } else if (result.error === "webhook_not_configured") {
      showStatus(status, "error",
        "⚠️ Webhook non configurato. Contatta il team per configurare lo script.");
    } else {
      showStatus(status, "error",
        "❌ Errore nell'invio. Prova a contattarci direttamente via telefono o email.");
    }
  });
}

function buildDomicilioEmbed(data) {
  const dateFormatted = data.date
    ? new Date(data.date + "T12:00:00").toLocaleDateString("it-IT", { weekday: "long", year: "numeric", month: "long", day: "numeric" })
    : "—";

  return {
    title: "🏠 RICHIESTA DOMICILIO — Atlas Barber",
    color: 0x00D4FF,
    thumbnail: { url: "https://pantheraleo-atlasvalley.github.io/resources/images/logo.jpg" },
    fields: [
      { name: "👤 Cliente",        value: data.name || "—",                 inline: true },
      { name: "📞 Telefono",       value: data.phone || "—",                inline: true },
      { name: "📧 Email",          value: data.email || "—",                inline: true },
      { name: "✂️ Servizio",       value: data.service || "—",              inline: true },
      { name: "👥 Persone",        value: data.people || "—",               inline: true },
      { name: "🏷️ Tipo Luogo",    value: data.location_type || "—",        inline: true },
      { name: "📍 Indirizzo",      value: data.address || "—",              inline: false },
      { name: "📅 Data",           value: dateFormatted,                    inline: true },
      { name: "🕐 Fascia Oraria",  value: data.time || "—",                 inline: true },
      { name: "📝 Note",           value: data.notes || "Nessuna nota",     inline: false }
    ],
    footer: {
      text: "⚡ Atlas Barber · Servizio a Domicilio · Atlas Valley Ecosystem",
      icon_url: "https://pantheraleo-atlasvalley.github.io/resources/images/logo.jpg"
    },
    timestamp: new Date().toISOString()
  };
}

// ============================================
// UI HELPERS
// ============================================

function setButtonLoading(btn, loading) {
  if (!btn) return;
  const textEl = btn.querySelector(".btn-text");
  const loadEl = btn.querySelector(".btn-loading");

  btn.disabled = loading;

  if (textEl) textEl.style.display = loading ? "none" : "inline";
  if (loadEl) loadEl.style.display = loading ? "inline" : "none";
}

function showStatus(el, type, message) {
  if (!el) return;
  el.textContent = message;
  el.className = `form-status ${type}`;
  el.style.display = "block";

  if (type === "success") {
    setTimeout(() => {
      el.style.display = "none";
    }, 8000);
  }
}

function hideStatus(el) {
  if (!el) return;
  el.style.display = "none";
  el.textContent = "";
  el.className = "form-status";
}
