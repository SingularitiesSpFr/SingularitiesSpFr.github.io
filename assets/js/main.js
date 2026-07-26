(() => {
  const header = document.querySelector("[data-header]");
  const nav = document.querySelector("#primary-navigation");
  const toggle = document.querySelector(".nav-toggle");
  const navLinks = [...document.querySelectorAll(".primary-nav a")];
  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const closeMenu = () => {
    toggle?.setAttribute("aria-expanded", "false");
    nav?.classList.remove("is-open");
  };

  toggle?.addEventListener("click", () => {
    const willOpen = toggle.getAttribute("aria-expanded") !== "true";
    toggle.setAttribute("aria-expanded", String(willOpen));
    nav?.classList.toggle("is-open", willOpen);
  });

  navLinks.forEach((link) => link.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && toggle?.getAttribute("aria-expanded") === "true") {
      closeMenu();
      toggle?.focus();
    }
  });

  const updateHeader = () => {
    header?.classList.toggle("is-scrolled", window.scrollY > 24);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;

        navLinks.forEach((link) => {
          const isCurrent = link.getAttribute("href") === `#${visible.target.id}`;
          if (isCurrent) {
            link.setAttribute("aria-current", "true");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      },
      {
        rootMargin: "-25% 0px -65% 0px",
        threshold: [0, 0.2, 0.5]
      }
    );

    sections.forEach((section) => observer.observe(section));
  }
})();
