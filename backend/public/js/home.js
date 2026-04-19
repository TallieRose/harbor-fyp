
const token = localStorage.getItem("token");
const loginLink = document.getElementById("loginLink");
if (loginLink && token) {
  loginLink.textContent = "Dashboard";
  loginLink.href = "dashboard.html";
}
