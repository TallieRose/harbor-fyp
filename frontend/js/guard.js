function requireLogin() {
  const token = localStorage.getItem("token");
  if (!token) window.location.href = "login.html";
}

function requireStaff() {
  requireLogin();
  const role = localStorage.getItem("role");
  if (role !== "staff" && role !== "admin") {
    window.location.href = "dashboard.html";
  }
}