const container = document.getElementById("requestsContainer");
const refreshBtn = document.getElementById("refreshBtn");
const logoutBtn = document.getElementById("logoutBtn");

const statusSummary = document.getElementById("statusSummary");
const tabButtons = Array.from(document.querySelectorAll(".tab-btn"));

const countSubmitted = document.getElementById("countSubmitted");
const countResponded = document.getElementById("countResponded");
const countClosed = document.getElementById("countClosed");

let currentStatus = "submitted";


logoutBtn.addEventListener("click", () => {
  localStorage.clear();
  window.location.href = "login.html";
});

tabButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    currentStatus = btn.dataset.status;
    setActiveTab(btn);
    updateSummary();
    loadRequests();
  });
});

function setActiveTab(activeBtn) {
  tabButtons.forEach(btn => {
    const isActive = btn === activeBtn;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
}

function updateSummary() {
  statusSummary.textContent =
    currentStatus.charAt(0).toUpperCase() + currentStatus.slice(1);
}

async function loadCounts() {
  try {
    const res = await apiRequest(`/support-requests`);
    const all = res.data || [];

    countSubmitted.textContent =
      all.filter(r => r.status === "submitted").length;

    countResponded.textContent =
      all.filter(r => r.status === "responded").length;

    countClosed.textContent =
      all.filter(r => r.status === "closed").length;

  } catch (_) {
    
  }
}

async function loadRequests() {
  container.innerHTML = `<div class="empty-state">Loading…</div>`;

  try {
    const result = await apiRequest(
      `/support-requests?status=${currentStatus}`
    );

    renderRequests(result.data);
    loadCounts();

  } catch (err) {
    container.innerHTML =
      `<div class="empty-state">${err.message}</div>`;
  }
}

function renderRequests(requests) {

  container.innerHTML = "";

  if (!requests || requests.length === 0) {
    container.innerHTML =
      `<div class="empty-state">No ${currentStatus} requests.</div>`;
    return;
  }

  requests.forEach(req => {

    const card = document.createElement("div");
    card.className = "request-card";

    const isClosed = req.status === "closed";

    card.innerHTML = `
      <div class="request-top">
        <div>
          <h3 class="request-title">${req.subject}</h3>
          <div class="request-meta">
            <span class="meta-chip">Category: ${req.category}</span>
            <span class="meta-chip">ID: ${req.id}</span>
          </div>
        </div>

        <span class="status-badge status-${req.status}">
          ${req.status.toUpperCase()}
        </span>
      </div>

      <div class="request-body">${req.message}</div>

      ${req.staff_response ? `
        <div class="staff-response">
          <strong>Previous staff response</strong>
          <div>${req.staff_response}</div>
        </div>
      ` : ""}

      ${!isClosed ? `
        <div class="response-area">
          <textarea class="responseInput"
            placeholder="Write a response…"></textarea>

          <div class="request-actions">
            <button class="primary-btn respondBtn">Send response</button>
            <button class="btn-ghost closeBtn">Close request</button>
          </div>
        </div>
      ` : `
        <div class="response-area">
          <textarea class="responseInput" disabled
            placeholder="Closed requests can’t be edited."></textarea>
        </div>
      `}
    `;

    const textarea = card.querySelector(".responseInput");
    const respondBtn = card.querySelector(".respondBtn");
    const closeBtn = card.querySelector(".closeBtn");

    if (respondBtn) {
      respondBtn.addEventListener("click", async () => {

        const responseText = textarea.value.trim();
        if (!responseText) return alert("Write a response first.");

        respondBtn.disabled = true;
        respondBtn.textContent = "Sending…";

        try {
          await apiRequest(
            `/support-requests/${req.id}/respond`,
            "PATCH",
            { staff_response: responseText }
          );

 
          currentStatus = "responded";

          const tab = document.querySelector(`[data-status="responded"]`);
          setActiveTab(tab);
          updateSummary();
          loadRequests();

        } catch (err) {
          alert(err.message);
        } finally {
          respondBtn.disabled = false;
          respondBtn.textContent = "Send response";
        }
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", async () => {

        closeBtn.disabled = true;
        closeBtn.textContent = "Closing…";

        try {
          await apiRequest(
            `/support-requests/${req.id}/close`,
            "PATCH"
          );

      
          currentStatus = "closed";

          const tab = document.querySelector(`[data-status="closed"]`);
          setActiveTab(tab);
          updateSummary();
          loadRequests();

        } catch (err) {
          alert(err.message);
        } finally {
          closeBtn.disabled = false;
          closeBtn.textContent = "Close request";
        }
      });
    }

    container.appendChild(card);
  });
}

updateSummary();
loadCounts();
loadRequests();