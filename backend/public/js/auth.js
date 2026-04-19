document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;

  const errorEl = document.getElementById("error");
  if (errorEl) errorEl.innerText = "";

  try {
    const data = await apiRequest("/auth/login", "POST", { email, password });

    localStorage.setItem("token", data.token);
    localStorage.setItem("role", data.user.role);

    if (data.user.role === "staff" || data.user.role === "admin") {
      window.location.href = "staff.html";
    } else {
      window.location.href = "dashboard.html";
    }
  } catch (err) {
    if (errorEl) errorEl.innerText = err.message;
  }
});