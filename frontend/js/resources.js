const token = localStorage.getItem("token");
const loginLink = document.getElementById("loginLink");
const dashboardLink = document.getElementById("dashboardLink");

if (token) {
  if (loginLink) loginLink.style.display = "none";
  if (dashboardLink) dashboardLink.style.display = "inline-flex";
} else {
  if (loginLink) loginLink.style.display = "inline-flex";
  if (dashboardLink) dashboardLink.style.display = "none";
}