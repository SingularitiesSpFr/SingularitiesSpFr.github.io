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
  };

  const closeProgrammeDetail = ({ restoreFocus = false } = {}) => {
    const talkToRestore = selectedTalk;
    if (selectedTalk) resetTalk(selectedTalk);
    selectedTalk = null;

    if (programmeContent) programmeContent.hidden = true;
    programmeDetail?.classList.remove("is-visible");
    if (programmeStatus) programmeStatus.textContent = "Talk details closed.";

    if (restoreFocus && talkToRestore) {
      talkToRestore.focus();
      talkToRestore.scrollIntoView({ block: "center", inline: "center" });
    }
  };

  if (
    timetableTalks.length &&
    programmeDetail &&
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
      talk.addEventListener("click", (event) => {
        if (selectedTalk === talk) {
          closeProgrammeDetail();
          return;
        }

        if (selectedTalk) resetTalk(selectedTalk);
        selectedTalk = talk;

        const speaker = talk.querySelector(".timetable-speaker")?.textContent.trim() || "Speaker";
        const title = talk.querySelector(".timetable-title")?.textContent.trim() || "Title forthcoming";

        talk.classList.add("is-selected");
        talk.setAttribute("aria-expanded", "true");

        detailDay.textContent = talk.dataset.day || "";
        detailTime.textContent = talk.dataset.time || "";
        detailTitle.textContent = title;
        detailSpeaker.textContent = speaker;
        detailAbstract.textContent = talk.dataset.abstract || "Abstract forthcoming.";
        programmeContent.hidden = false;
        programmeDetail.classList.add("is-visible");
        programmeReturn.setAttribute("aria-label", `Return to ${speaker} in the timetable`);
        programmeStatus.textContent = `Showing details for ${speaker}, ${talk.dataset.day}, ${talk.dataset.time}.`;

        if (event.detail === 0) {
          requestAnimationFrame(() => {
            programmeDetail.focus({ preventScroll: true });
            programmeDetail.scrollIntoView({ block: "start" });
          });
        }
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

  const web3Forms = [...document.querySelectorAll("[data-web3form]")];

  web3Forms.forEach((form) => {
    const status = form.querySelector("[data-form-status]");
    const submit = form.querySelector("[data-form-submit]");
    const submitLabel = form.querySelector("[data-form-submit-label]");

    if (!status || !submit || !submitLabel) return;

    const defaultSubmitLabel = submitLabel.textContent.trim();

    const showFormStatus = (message, type = "success") => {
      status.hidden = false;
      status.textContent = message;
      status.classList.toggle("is-error", type === "error");
      status.focus({ preventScroll: true });
    };

    const setFormPending = (isPending) => {
      form.setAttribute("aria-busy", String(isPending));
      submit.disabled = isPending;
      submitLabel.textContent = isPending
        ? form.dataset.pendingLabel || "Sending…"
        : defaultSubmitLabel;
    };

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      setFormPending(true);
      status.hidden = true;
      status.classList.remove("is-error");

      const payload = Object.fromEntries(new FormData(form));

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify(payload)
        });
        const result = await response.json();

        if (!response.ok || result.success !== true) {
          throw new Error("The form request was not accepted.");
        }

        form.reset();
        showFormStatus(form.dataset.successMessage || "Thank you — your request has been sent.");
      } catch (error) {
        showFormStatus(
          form.dataset.errorMessage || "We could not send your request. Please try again.",
          "error"
        );
      } finally {
        setFormPending(false);
      }
    });
  });
})();
