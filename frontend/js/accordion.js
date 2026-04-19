document.querySelectorAll(".accordion-header").forEach((button) => {
  button.addEventListener("click", () => {
    const item = button.parentElement;
    const content = item.querySelector(".accordion-content");
    const isOpen = item.classList.contains("open");

    document.querySelectorAll(".accordion-item").forEach((otherItem) => {
      otherItem.classList.remove("open");
      const otherContent = otherItem.querySelector(".accordion-content");
      if (otherContent) otherContent.style.maxHeight = null;
    });

    if (!isOpen) {
      item.classList.add("open");
      content.style.maxHeight = content.scrollHeight + "px";
    }
  });
});

const hash = window.location.hash.slice(1);
if (hash) {
  const target = document.getElementById(hash);
  if (target && target.classList.contains("accordion-item")) {
    const content = target.querySelector(".accordion-content");
    if (content) {
      target.classList.add("open");
      setTimeout(() => {
        content.style.maxHeight = content.scrollHeight + "px";
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  }
}
