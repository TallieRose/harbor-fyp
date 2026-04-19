document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const full_name = document.getElementById("full_name").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm").value;

  const errorEl = document.getElementById("error");
  errorEl.innerText = "";


  if (password !== confirm) {
    errorEl.innerText = "Passwords do not match.";
    return;
  }

  try {
    await apiRequest("/auth/register", "POST", {
      username,
      full_name,
      email,
      password
    });

    // go to login after successful register
    window.location.href = "login.html";
  } catch (err) {
    errorEl.innerText = err.message;
  }
});