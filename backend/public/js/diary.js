

const diaryForm  = document.getElementById("diaryForm");
const diaryList  = document.getElementById("diaryList");
const diaryError = document.getElementById("diaryError");


const entryDateInput = document.getElementById("entry_date");
if (entryDateInput && !entryDateInput.value) {
  entryDateInput.value = new Date().toISOString().slice(0, 10);
}

async function loadDiaryEntries() {
  if (!diaryList) return;
  try {
    const res     = await apiRequest("/diary-entries");
    const entries = res.data || [];

    if (entries.length === 0) {
      diaryList.innerHTML = `
        <li class="diary-empty-state">
          <p class="diary-empty-primary">No entries yet.</p>
          <p class="diary-empty-secondary">Your first entry is waiting to be written.</p>
        </li>`;
      return;
    }

    const moodLabel = { very_low:"Very low", low:"Low", neutral:"Neutral", good:"Good", very_good:"Very good" };

    diaryList.innerHTML = entries.map(e => {
      const dateStr = e.entry_date
        ? new Date(e.entry_date + "T00:00:00").toLocaleDateString("en-GB", { day:"numeric", month:"short", year:"numeric" })
        : "";
      const moodPill = e.mood
        ? `<span class="diary-mood-pill">${moodLabel[e.mood] || e.mood}</span>`
        : "";

      return `
        <li data-mood="${escapeHtml(e.mood || "")}">
          <div class="diary-entry-header">
            <div>
              ${e.title ? `<div class="diary-entry-title">${escapeHtml(e.title)}</div>` : ""}
              <div class="diary-entry-date">${dateStr}</div>
            </div>
            ${moodPill}
          </div>
          <p class="diary-entry-text">${escapeHtml(e.entry_text || "")}</p>
          <button onclick="deleteDiaryEntry(${e.id})" class="diary-delete-btn" type="button">Delete</button>
        </li>`;
    }).join("");
  } catch (err) {
    if (diaryList) diaryList.innerHTML = `<li style="border:none;"><p class="dash-error">${escapeHtml(err.message)}</p></li>`;
  }
}

async function deleteDiaryEntry(id) {
  try {
    await apiRequest(`/diary-entries/${id}`, "DELETE");
    loadDiaryEntries();
    loadOverviewMood();
  } catch (err) {
    if (diaryError) diaryError.textContent = err.message;
  }
}

diaryForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (diaryError) diaryError.textContent = "";

  const entry_date = document.getElementById("entry_date")?.value;
  const title      = document.getElementById("title")?.value.trim();
  const mood       = document.getElementById("mood")?.value;
  const entry_text = document.getElementById("entry_text")?.value.trim();

  try {
    await apiRequest("/diary-entries", "POST", { entry_date, title, mood, entry_text });
    diaryForm.reset();
    // reset date to today
    if (entryDateInput) entryDateInput.value = new Date().toISOString().slice(0, 10);
    // reset mood chips
    document.querySelectorAll('.diary-mood-chip').forEach(c => c.classList.remove('dmc-active'));
    const noneChip = document.querySelector('.diary-mood-chip[data-mood=""]');
    if (noneChip) noneChip.classList.add('dmc-active');

    loadDiaryEntries();
    loadOverviewMood();
  } catch (err) {
    if (diaryError) diaryError.textContent = err.message;
  }
});

// load on section open
document.querySelectorAll('.dash-link[data-section="diary"]').forEach(btn => {
  btn.addEventListener("click", loadDiaryEntries);
});


if (document.getElementById("diarySection")?.classList.contains("active")) {
  loadDiaryEntries();
}