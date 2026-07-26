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

  const timetableTalks = [...document.querySelectorAll(".timetable-talk")];
  const programmeDetail = document.querySelector("#programme-detail");
  const programmePrompt = document.querySelector("[data-programme-prompt]");
  const programmeContent = document.querySelector("[data-programme-content]");
  const programmeStatus = document.querySelector("[data-programme-status]");
  const programmeReturn = document.querySelector("[data-programme-return]");
  const detailDay = document.querySelector("[data-detail-day]");
  const detailTime = document.querySelector("[data-detail-time]");
  const detailTitle = document.querySelector("[data-detail-title]");
  const detailSpeaker = document.querySelector("[data-detail-speaker]");
  const detailAbstract = document.querySelector("[data-detail-abstract]");
  let selectedTalk = null;

  const resetTalk = (talk) => {
    talk.classList.remove("is-selected");
    talk.setAttribute("aria-expanded", "false");
    const abstractJump = talk.parentElement?.querySelector(".timetable-abstract-jump");
    if (abstractJump) abstractJump.hidden = true;
  };

  const closeProgrammeDetail = ({ restoreFocus = false } = {}) => {
    const talkToRestore = selectedTalk;
    if (selectedTalk) resetTalk(selectedTalk);
    selectedTalk = null;

    if (programmePrompt) programmePrompt.hidden = false;
    if (programmeContent) programmeContent.hidden = true;
    if (programmeStatus) programmeStatus.textContent = "Talk details closed.";

    if (restoreFocus && talkToRestore) {
      talkToRestore.focus();
      talkToRestore.scrollIntoView({ block: "center", inline: "center" });
    }
  };

  if (
    timetableTalks.length &&
    programmeDetail &&
    programmePrompt &&
    programmeContent &&
    programmeStatus &&
    programmeReturn &&
    detailDay &&
    detailTime &&
    detailTitle &&
    detailSpeaker &&
    detailAbstract
  ) {
    timetableTalks.forEach((talk) => {
      talk.addEventListener("click", () => {
        if (selectedTalk === talk) {
          closeProgrammeDetail();
          return;
        }

        if (selectedTalk) resetTalk(selectedTalk);
        selectedTalk = talk;

        const speaker = talk.querySelector(".timetable-speaker")?.textContent.trim() || "Speaker";
        const title = talk.querySelector(".timetable-title")?.textContent.trim() || "Title to be announced";
        const abstractJump = talk.parentElement?.querySelector(".timetable-abstract-jump");

        talk.classList.add("is-selected");
        talk.setAttribute("aria-expanded", "true");
        if (abstractJump) {
          abstractJump.hidden = false;
          abstractJump.setAttribute("aria-label", `Read abstract for ${speaker} below`);
        }

        detailDay.textContent = talk.dataset.day || "";
        detailTime.textContent = talk.dataset.time || "";
        detailTitle.textContent = title;
        detailSpeaker.textContent = speaker;
        detailAbstract.textContent = talk.dataset.abstract || "Abstract to be announced.";
        programmePrompt.hidden = true;
        programmeContent.hidden = false;
        programmeStatus.textContent = `Showing details for ${speaker}, ${talk.dataset.day}, ${talk.dataset.time}.`;
      });
    });

    programmeReturn.addEventListener("click", () => {
      selectedTalk?.focus();
      selectedTalk?.scrollIntoView({ block: "center", inline: "center" });
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && selectedTalk) {
        closeProgrammeDetail({ restoreFocus: true });
      }
    });
  }

  const registrationForm = document.querySelector("[data-registration-form]");
  const registrationStatus = document.querySelector("[data-registration-status]");
  const registrationSubmit = document.querySelector("[data-registration-submit]");
  const registrationSubmitLabel = document.querySelector("[data-registration-submit-label]");

  if (registrationForm && registrationStatus && registrationSubmit && registrationSubmitLabel) {
    const defaultSubmitLabel = registrationSubmitLabel.textContent;

    const showRegistrationStatus = (message, type = "success") => {
      registrationStatus.hidden = false;
      registrationStatus.textContent = message;
      registrationStatus.classList.toggle("is-error", type === "error");
      registrationStatus.setAttribute("role", type === "error" ? "alert" : "status");
      registrationStatus.focus({ preventScroll: true });
    };

    const setRegistrationPending = (isPending) => {
      registrationForm.setAttribute("aria-busy", String(isPending));
      registrationSubmit.disabled = isPending;
      registrationSubmitLabel.textContent = isPending ? "Sending registration…" : defaultSubmitLabel;
    };

    registrationForm.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!registrationForm.checkValidity()) {
        registrationForm.reportValidity();
        return;
      }

      setRegistrationPending(true);
      registrationStatus.hidden = true;
      registrationStatus.classList.remove("is-error");

      const payload = Object.fromEntries(new FormData(registrationForm));

      try {
        const response = await fetch(registrationForm.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || result.success === false) {
          throw new Error("Registration request was not accepted.");
        }

        registrationForm.reset();
        showRegistrationStatus("Thank you — your registration has been sent to the conference organisers.");
      } catch (error) {
        showRegistrationStatus(
          "We could not send your registration. Please try again or email singularities-fr-sp@gmail.com.",
          "error"
        );
      } finally {
        setRegistrationPending(false);
      }
    });
  }
})();
