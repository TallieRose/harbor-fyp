
document.getElementById("logoutBtn")?.addEventListener("click", () => {
  localStorage.removeItem("token");
  localStorage.removeItem("role");
  window.location.href = "login.html";
});

(function() {
  const days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
  const months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const now = new Date();
  const dayEl  = document.getElementById("heroDayName");
  const dateEl = document.getElementById("heroDateFull");
  if (dayEl)  dayEl.textContent  = days[now.getDay()];
  if (dateEl) dateEl.textContent = now.getDate() + " " + months[now.getMonth()] + " " + now.getFullYear();
})();

const links = document.querySelectorAll(".dash-link");
const sections = {
  overview:  document.getElementById("overviewSection"),
  support:   document.getElementById("supportSection"),
  requests:  document.getElementById("requestsSection"),
  diary:     document.getElementById("diarySection"),
  mood:      document.getElementById("moodSection"),
  bookmarks: document.getElementById("bookmarksSection")
};

function showSection(key) {
  Object.values(sections).forEach(s => { if (s) s.classList.remove("active"); });
  if (sections[key]) sections[key].classList.add("active");

  links.forEach(b => b.classList.remove("active"));
  document.querySelector(`.dash-link[data-section="${key}"]`)?.classList.add("active");

  if (key === "requests")  loadRequests();
  if (key === "mood")      { loadMoodBars(); setTimeout(initMoodPicker, 50); }
  if (key === "overview")  loadOverviewMood();
  if (key === "bookmarks") loadBookmarks();
}

links.forEach(btn => {
  btn.addEventListener("click", () => showSection(btn.dataset.section));
});

showSection("overview");

document.querySelectorAll(".cat-chip").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".cat-chip").forEach(c => c.classList.remove("active"));
    btn.classList.add("active");
    const catInput = document.getElementById("category");
    if (catInput) catInput.value = btn.dataset.value;
  });
});

const anonRow    = document.getElementById("anonRow");
const anonToggle = document.getElementById("anonToggle");
const anonCheck  = document.getElementById("isAnonymous");

anonRow?.addEventListener("click", () => {
  const isOn = !anonCheck.checked;
  anonCheck.checked = isOn;
  anonToggle?.classList.toggle("on", isOn);
  anonRow.classList.toggle("is-anon", isOn);
});

async function loadRequests() {
  const container = document.getElementById("requests");
  if (!container) return;
  container.innerHTML = "<p class='dash-muted' style='padding:8px 2px;'>Loading…</p>";
  try {
    const res = await apiRequest("/support-requests", "GET");
    const rows = res.data || [];

    if (rows.length === 0) {
      container.innerHTML = `
        <div class="req-empty">
          <div class="req-empty-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 18V7a3 3 0 013-3h12a3 3 0 013 3v8a3 3 0 01-3 3H7l-4 3V18z"
                stroke="#a8c4ae" stroke-width="1.4" stroke-linejoin="round"/>
              <path d="M8 10h8M8 13.5h5" stroke="#a8c4ae" stroke-width="1.3" stroke-linecap="round"/>
            </svg>
          </div>
          <p class="req-empty-title">Nothing here yet</p>
          <p class="req-empty-sub">When you send a support request, it will appear here. You can also track any replies from staff.</p>
        </div>`;
      return;
    }

    const catColour = {
      general:   "req-cat-general",
      finance:   "req-cat-finance",
      housing:   "req-cat-housing",
      wellbeing: "req-cat-wellbeing"
    };

    const catIcon = {
      general:   `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="5" stroke="currentColor" stroke-width="1.3"/><path d="M6 5.5v3M6 4v.5" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>`,
      finance:   `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><rect x="1" y="2.5" width="10" height="7" rx="1.5" stroke="currentColor" stroke-width="1.2"/><path d="M1 5h10" stroke="currentColor" stroke-width="1.1"/><circle cx="3.5" cy="7.5" r=".8" fill="currentColor"/></svg>`,
      housing:   `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M1.5 6L6 1.5 10.5 6V11H7.5V8H4.5v3H1.5V6z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`,
      wellbeing: `<svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M6 10S1.5 7 1.5 4a2.5 2.5 0 015-0c.16-.9 1-1.5 2-1.5A2.5 2.5 0 0110.5 5c0 2.5-4.5 5-4.5 5z" stroke="currentColor" stroke-width="1.2" stroke-linejoin="round"/></svg>`
    };

    const statusCfg = {
      submitted: { label: "Waiting",   cls: "req-badge-waiting",   dot: "#d4a0af" },
      responded: { label: "Reply in",  cls: "req-badge-replied",   dot: "#7aab8a" },
      closed:    { label: "Resolved",  cls: "req-badge-resolved",  dot: "#c4d8ca" }
    };

    container.innerHTML = rows.map(r => {
      const cat  = r.category || "general";
      const s    = statusCfg[r.status] || statusCfg.submitted;
      const cc   = catColour[cat]  || catColour.general;
      const icon = catIcon[cat]    || catIcon.general;
      return `
        <div class="req-card">
          <div class="req-card-accent ${cc}"></div>
          <div class="req-card-body">
            <div class="req-card-row1">
              <div class="req-cat-pill ${cc}">
                ${icon}
                ${escapeHtml(cat)}
              </div>
              <div class="req-badge ${s.cls}">
                <span class="req-badge-dot" style="background:${s.dot}"></span>
                ${s.label}
              </div>
            </div>
            <div class="req-subject">${escapeHtml(r.subject)}</div>
            <p class="req-message">${escapeHtml(r.message)}</p>
            ${r.is_anonymous ? '<span class="req-anon-chip">Submitted anonymously</span>' : ""}
            ${r.staff_response ? `
              <div class="req-reply">
                <div class="req-reply-header">
                  <svg width="13" height="13" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 10V5a2.5 2.5 0 012.5-2.5h5A2.5 2.5 0 0112 5v4a2.5 2.5 0 01-2.5 2.5H5L2 13V10z"
                      stroke="#3a6347" stroke-width="1.3" stroke-linejoin="round"/>
                    <path d="M4.5 6.5h5M4.5 8.5h3.5" stroke="#3a6347" stroke-width="1.1" stroke-linecap="round"/>
                  </svg>
                  <span>Reply from your support advisor</span>
                </div>
                <p class="req-reply-text">${escapeHtml(r.staff_response)}</p>
              </div>` : ""}
          </div>
        </div>`;
    }).join("");

    const open = rows.filter(r => r.status !== "closed").length;
    const el = document.getElementById("statRequests");
    if (el) el.textContent = open;
  } catch (err) {
    container.innerHTML = `<p class="dash-error">${err.message}</p>`;
  }
}
document.getElementById("refreshBtn")?.addEventListener("click", loadRequests);

document.getElementById("supportForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const errEl = document.getElementById("supportError");
  if (errEl) errEl.innerText = "";
  const subject      = document.getElementById("subject").value.trim();
  const message      = document.getElementById("message").value.trim();
  const category     = document.getElementById("category").value;
  const is_anonymous = document.getElementById("isAnonymous").checked;
  try {
    await apiRequest("/support-requests", "POST", { subject, message, category, is_anonymous });
    document.getElementById("supportForm").reset();

    document.querySelectorAll(".cat-chip").forEach((c, i) => c.classList.toggle("active", i === 0));
    document.getElementById("category").value = "general";
    anonCheck.checked = false;
    anonToggle?.classList.remove("on");
    anonRow?.classList.remove("is-anon");
    showSection("requests");
  } catch (err) {
    if (errEl) errEl.innerText = err.message;
  }
});

const REM_KEY = "harbor_reminders";

function getReminders() {
  try { return JSON.parse(localStorage.getItem(REM_KEY) || "[]"); }
  catch { return []; }
}

function saveReminders(list) {
  localStorage.setItem(REM_KEY, JSON.stringify(list));
}

function renderReminders(listElId, reminders) {
  const el = document.getElementById(listElId);
  if (!el) return;
  if (reminders.length === 0) {
    el.innerHTML = `<p class="dash-muted">No reminders yet.</p>`;
    return;
  }
  el.innerHTML = reminders.map((r, idx) => `
    <div class="dash-item dash-item-row">
      <span>${escapeHtml(r)}</span>
      <button class="dash-x" data-i="${idx}" type="button">✕</button>
    </div>
  `).join("");
  el.querySelectorAll(".dash-x").forEach(btn => {
    btn.addEventListener("click", () => {
      const i = Number(btn.dataset.i);
      const current = getReminders();
      current.splice(i, 1);
      saveReminders(current);
      renderReminders("reminderList", current);
    });
  });
}

function setupReminderForm(formId, inputId) {
  const form  = document.getElementById(formId);
  const input = document.getElementById(inputId);
  if (!form || !input) return;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    const current = getReminders();
    current.unshift(text);
    saveReminders(current);
    input.value = "";
    renderReminders("reminderList", current);
  });
}

setupReminderForm("reminderForm", "reminderText");

const initialRem = getReminders();
renderReminders("reminderList", initialRem);

const quotes = [
  "You are not behind. You are rebuilding.",
  "Small steps still count.",
  "You deserve stability and peace.",
  "Breathe. You're safe right now.",
  "Progress is quiet. Keep going.",
  "You are allowed to ask for help.",
  "One day at a time. 🌿"
];

function randomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function renderQuote() {
  const q = randomQuote();
  const el = document.getElementById("dailyLetter");
  if (el) el.textContent = q;
}

document.getElementById("newQuoteBtn")?.addEventListener("click", renderQuote);
renderQuote();

function moodLabel(key) { return key.replace("_", " "); }
function moodOrder()    { return ["very_low","low","neutral","good","very_good"]; }

async function getDiaryMoodsLast30() {
  const res     = await apiRequest("/diary-entries");
  const entries = res.data || [];

  const byDate = {};
  entries.forEach(e => {
    const d = (e.entry_date || "").slice(0, 10);
    if (d && !byDate[d]) byDate[d] = e;      
  });

  const days = Object.keys(byDate)
    .sort((a, b) => b.localeCompare(a))
    .slice(0, 30);

  const counts = { very_low:0, low:0, neutral:0, good:0, very_good:0 };
  days.forEach(d => {
    const m = byDate[d].mood;
    if (counts[m] !== undefined) counts[m]++;
  });

  return { counts, total: days.length, byDate, days };
}

async function loadOverviewMood() {
  const el = document.getElementById("moodSummary");
  if (!el) return;
  try {
    const { counts, total } = await getDiaryMoodsLast30();
    if (total === 0) {
      el.innerHTML = `<p class="dash-muted">No diary entries yet. Add one to start mood tracking.</p>`;
      return;
    }
    let top = { key: "neutral", value: 0 };
    Object.keys(counts).forEach(k => { if (counts[k] > top.value) top = { key: k, value: counts[k] }; });

    const moodEl = document.getElementById("statMood");
    if (moodEl) moodEl.textContent = moodLabel(top.key);

    const diaryEl = document.getElementById("statDiary");
    if (diaryEl) diaryEl.textContent = total;

    const max = Math.max(...Object.values(counts), 1);
    el.innerHTML = `
      <div class="mood-badge">${moodLabel(top.key)}</div>
      ${moodOrder().map(k => `
        <div class="mood-row">
          <div class="mood-name">${moodLabel(k)}</div>
          <div class="mood-bar"><div class="mood-fill${k === "very_low" || k === "low" ? " low" : ""}" style="width:${Math.round((counts[k] / max) * 100)}%"></div></div>
          <div class="mood-count">${counts[k]}</div>
        </div>
      `).join("")}
      <p class="dash-muted">Open "Mood Tracker" to see the full breakdown.</p>
    `;
  } catch (err) {
    el.innerHTML = `<p class="dash-error">${err.message}</p>`;
  }
}

async function loadMoodBars() {
  const container = document.getElementById("moodBars");
  if (!container) return;
  container.innerHTML = "";
  try {
    const { counts, total, byDate, days } = await getDiaryMoodsLast30();
    if (total === 0) {
      container.innerHTML = `
        <div class="mt-empty">
          <p class="mt-empty-title">No mood history yet</p>
          <p class="mt-empty-sub">Use the check-in above or add diary entries with a mood to start building your history.</p>
        </div>`;
      return;
    }

    const moodMeta = {
      very_low:  { colour: "var(--blush-mid)",    label: "Very low"  },
      low:       { colour: "#d4bac3",              label: "Low"       },
      neutral:   { colour: "var(--sage-pale)",     label: "Neutral"   },
      good:      { colour: "var(--matcha-light)",  label: "Good"      },
      very_good: { colour: "var(--matcha-mid)",    label: "Very good" }
    };

    const topKey = moodOrder().reduce((a, b) => counts[a] >= counts[b] ? a : b);

    const summaryHTML = `
      <div class="mt-summary-strip">
        <div class="mt-summary-item">
          <span class="mt-summary-num">${total}</span>
          <span class="mt-summary-lbl">days logged</span>
        </div>
        <div class="mt-summary-divider"></div>
        <div class="mt-summary-item">
          <span class="mt-summary-num" style="text-transform:capitalize;">${moodLabel(topKey)}</span>
          <span class="mt-summary-lbl">most frequent mood</span>
        </div>
        <div class="mt-summary-divider"></div>
        <div class="mt-summary-item">
          <span class="mt-summary-num">${counts[topKey]}</span>
          <span class="mt-summary-lbl">times this month</span>
        </div>
      </div>`;

    const timelineHTML = `
      <div class="mt-timeline">
        ${days.map(d => {
          const entry  = byDate[d];
          const m      = entry.mood;
          const meta   = moodMeta[m] || moodMeta.neutral;
          const label  = formatMoodDate(d);
          const isToday = d === new Date().toISOString().slice(0, 10);
          return `
            <div class="mt-tl-row">
              <div class="mt-tl-date${isToday ? " mt-tl-today" : ""}">${label}</div>
              <div class="mt-tl-dot" style="background:${meta.colour};" title="${meta.label}"></div>
              <div class="mt-tl-label" style="color:${meta.colour};">${meta.label}</div>
              ${entry.entry_text && entry.title !== "Mood check-in"
                ? `<div class="mt-tl-note">${escapeHtml(entry.title || "")}</div>`
                : ""}
            </div>`;
        }).join("")}
      </div>`;

    container.innerHTML = summaryHTML + timelineHTML;
  } catch (err) {
    container.innerHTML = `<p class="dash-error">${err.message}</p>`;
  }
}

function formatMoodDate(iso) {
  const d     = new Date(iso + "T00:00:00");
  const today = new Date().toISOString().slice(0, 10);
  const yest  = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (iso === today) return "Today";
  if (iso === yest)  return "Yesterday";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

(function() {
  let selectedMood  = null;
  let todayEntryId  = null;   

  async function initPicker() {
    const picker   = document.getElementById("moodPicker");
    const noteArea = document.getElementById("mtNoteArea");
    const feedback = document.getElementById("mtFeedback");
    if (!picker) return;


    picker.querySelectorAll(".mt-mood-btn").forEach(b => b.classList.remove("selected"));
    if (noteArea) noteArea.style.display = "none";
    if (feedback) feedback.style.display = "none";
    selectedMood = null;
    todayEntryId = null;

    // check for an existing entry today
    const today = new Date().toISOString().slice(0, 10);
    try {
      const res = await apiRequest("/diary-entries");
      const entries = res.data || [];
      const todayEntry = entries.find(e => (e.entry_date || "").slice(0, 10) === today);
      if (todayEntry && todayEntry.mood) {
        todayEntryId = todayEntry.id;
        selectedMood = todayEntry.mood;
        const existing = picker.querySelector(`.mt-mood-btn[data-mood="${todayEntry.mood}"]`);
        if (existing) existing.classList.add("selected");
        // show note area pre-filled if there's a note
        if (noteArea) {
          noteArea.style.display = "block";
          const inp = document.getElementById("mtNoteInput");
          if (inp) inp.value = (todayEntry.entry_text === "Logged a mood check-in." ? "" : todayEntry.entry_text || "");
        }
        // update save button label
        const saveBtn = document.getElementById("mtSaveBtn");
        if (saveBtn) saveBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-7" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Update today's mood`;
      } else {
        const saveBtn = document.getElementById("mtSaveBtn");
        if (saveBtn) saveBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-7" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Log mood`;
      }
    } catch (_) {  }

 
    if (picker.dataset.ready === "1") return;
    picker.dataset.ready = "1";

    picker.querySelectorAll(".mt-mood-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        selectedMood = btn.dataset.mood;
        picker.querySelectorAll(".mt-mood-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        if (noteArea) noteArea.style.display = "block";
        if (feedback) feedback.style.display = "none";
      });
    });

    document.getElementById("mtCancelBtn")?.addEventListener("click", () => {
      selectedMood = null;
      todayEntryId = null;
      picker.querySelectorAll(".mt-mood-btn").forEach(b => b.classList.remove("selected"));
      if (noteArea) noteArea.style.display = "none";
      const inp = document.getElementById("mtNoteInput");
      if (inp) inp.value = "";
    });

    document.getElementById("mtSaveBtn")?.addEventListener("click", async () => {
      if (!selectedMood) return;
      const note    = (document.getElementById("mtNoteInput")?.value || "").trim();
      const today   = new Date().toISOString().slice(0, 10);
      const saveBtn = document.getElementById("mtSaveBtn");
      const origLabel = saveBtn?.innerHTML || "";
      if (saveBtn) saveBtn.textContent = "Saving…";

      const payload = {
        entry_date: today,
        mood:       selectedMood,
        title:      "Mood check-in",
        entry_text: note || "Logged a mood check-in."
      };

      try {
        if (todayEntryId) {
          // entry exists for today 
          await apiRequest(`/diary-entries/${todayEntryId}`, "PUT", payload);
        } else {
          const result = await apiRequest("/diary-entries", "POST", payload);
          todayEntryId = result?.data?.id || null;
        }

        if (feedback) {
          feedback.textContent = todayEntryId
            ? "Today's mood updated. Keep going — you're doing great."
            : "Mood logged. Keep going — you're doing great.";
          feedback.className   = "mt-feedback mt-feedback-ok";
          feedback.style.display = "block";
        }
        if (noteArea) noteArea.style.display = "none";
        picker.querySelectorAll(".mt-mood-btn").forEach(b => b.classList.remove("selected"));
        const inp = document.getElementById("mtNoteInput");
        if (inp) inp.value = "";
        selectedMood = null;

        // update save button to reflect an entry now exists today
        if (saveBtn) saveBtn.innerHTML = `<svg width="13" height="13" viewBox="0 0 14 14" fill="none"><path d="M2 7l3.5 3.5 6.5-7" stroke="white" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg> Update today's mood`;

        loadMoodBars();
        loadOverviewMood();
      } catch (err) {
        if (feedback) {
          feedback.textContent = err.message || "Something went wrong. Please try again.";
          feedback.className   = "mt-feedback mt-feedback-err";
          feedback.style.display = "block";
        }
        if (saveBtn) saveBtn.innerHTML = origLabel;
      }
    });
  }

 
  window.initMoodPicker = initPicker;

  // Sidebar nav clicks
  const moodNavBtns = document.querySelectorAll('.dash-link[data-section="mood"]');
  moodNavBtns.forEach(btn => btn.addEventListener("click", () => setTimeout(initPicker, 50)));
})();

(function() {
  function initDiaryChips() {
    const chips = document.querySelectorAll('.diary-mood-chip');
    const select = document.getElementById('mood');
    if (!chips.length || !select) return;

    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        chips.forEach(c => c.classList.remove('dmc-active'));
        chip.classList.add('dmc-active');
        select.value = chip.dataset.mood;
      });
    });
    const resetChips = () => {
      chips.forEach(c => c.classList.remove('dmc-active'));
     
      const none = document.querySelector('.diary-mood-chip[data-mood=""]');
      if (none) none.classList.add('dmc-active');
      if (select) select.value = '';
    };

    document.querySelectorAll('.dash-link[data-section="diary"]').forEach(btn => {
      btn.addEventListener('click', resetChips);
    });


    resetChips();
  }

  initDiaryChips();
})();

loadOverviewMood();

async function loadBookmarks() {
  const container = document.getElementById("savedResourcesList");
  if (!container) return;

  const manifest = window.RESOURCE_MANIFEST || {};
  container.innerHTML = "<p class='dash-muted' style='padding:8px 2px;'>Loading…</p>";

  try {
    const res = await apiRequest("/bookmarks");
    const ids = res.data || [];

    if (ids.length === 0) {
      container.innerHTML = `
        <div class="saved-empty">
          <p class="saved-empty-text">No saved resources yet.</p>
          <p class="saved-empty-sub">Browse <a href="finance.html">Finance</a>, <a href="housing.html">Housing</a> or <a href="wellbeing.html">Wellbeing</a> and bookmark resources that are useful to you.</p>
        </div>`;
      return;
    }

    container.innerHTML = ids.map(id => {
      const r = manifest[id];
      if (!r) return "";
      const isExternal = r.href.startsWith("http");
      return `
        <div class="saved-card" data-bookmark-id="${id}">
          <div class="saved-card-body">
            <span class="saved-category-chip">${escapeHtml(r.category)}</span>
            <h3 class="saved-card-title">${escapeHtml(r.title)}</h3>
            <p class="saved-card-desc">${escapeHtml(r.description)}</p>
          </div>
          <div class="saved-card-actions">
            <a href="${r.href}"${isExternal ? ' target="_blank" rel="noopener"' : ''} class="primary-btn saved-visit-btn">Visit resource</a>
            <button class="btn-ghost saved-remove-btn" type="button" data-id="${id}">Remove</button>
          </div>
        </div>`;
    }).join("");

    container.querySelectorAll(".saved-remove-btn").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.dataset.id;
        btn.disabled = true;
        btn.textContent = "Removing…";
        try {
          await apiRequest(`/bookmarks/${id}`, "DELETE");
          btn.closest(".saved-card").remove();
          if (!container.querySelector(".saved-card")) {
            loadBookmarks();
          }
        } catch (_) {
          btn.disabled = false;
          btn.textContent = "Remove";
        }
      });
    });

  } catch (err) {
    container.innerHTML = `<p class="dash-muted">Couldn't load saved resources.</p>`;
  }
}

function escapeHtml(str) {
  if (str === null || str === undefined) return "";
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}