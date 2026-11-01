// Interactive parts of the Websites page: the "Which one is for me?" helper,
// the estimate form and the Monthly / Yearly running costs toggle.
// Everything on the page can still be read with JavaScript turned off.
(function () {
  const E = window.Estimate;
  if (!E) return;

  /* "Which one is for me?" helper ------------------------------------- */
  const helperButtons = document.querySelectorAll("[data-helper]");
  const helperStatus = document.getElementById("helper-status");
  const cards = document.querySelectorAll("[data-package]");

  function updateHelper() {
    const yes = (name) => document.querySelector('[data-helper="' + name + '"]').getAttribute("aria-pressed") === "true";
    const suggested = [];
    if (yes("old")) suggested.push("rescue");
    if (yes("lots")) suggested.push("bigger");
    if (!suggested.length) suggested.push("simple");

    cards.forEach((card) => {
      const on = suggested.includes(card.dataset.package);
      card.classList.toggle("is-suggested", on);
      card.querySelector(".suggested").hidden = !on;
    });
    const names = suggested.map((id) => E.data.packages.find((p) => p.id === id).name);
    helperStatus.textContent = "Suggested for you: " + names.join(" and ") + ".";
  }

  helperButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const pressed = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!pressed));
      updateHelper();
    });
  });

  /* Estimate form ------------------------------------------------------ */
  const form = document.getElementById("estimator");
  const rescueChoice = document.getElementById("rescue-choice");
  const out = (name) => document.querySelector('[data-out="' + name + '"]');
  const sendLink = document.getElementById("send-estimate");

  function readChoice() {
    const fd = new FormData(form);
    return {
      pkg: fd.get("package"),
      rescue: fd.get("rescue"),
      extras: fd.getAll("extras"),
      offer: fd.get("offer")
    };
  }

  function render() {
    const choice = readChoice();
    rescueChoice.hidden = choice.pkg !== "rescue";
    const r = E.calculate(choice);
    if (!r) return;

    out("package").textContent = E.pounds(r.packagePrice);
    out("offer").textContent = r.offerOff > 0 ? "minus " + E.pounds(r.offerOff) : "none";
    out("extras").textContent = E.pounds(r.extrasTotal);
    out("total").textContent = E.pounds(r.total);
    out("deposit").textContent = E.pounds(r.deposit);
    out("handover").textContent = E.pounds(r.onHandover);
    sendLink.href = "/contact/?estimate=" + E.toCode(choice);
  }

  // The two blocks of hours cannot both be ticked: ticking one unticks the other.
  form.addEventListener("change", (event) => {
    const box = event.target;
    if (box.name === "extras" && box.checked && box.dataset.excludes) {
      box.dataset.excludes.split(",").forEach((id) => {
        const other = form.querySelector('input[name="extras"][value="' + id + '"]');
        if (other) other.checked = false;
      });
    }
    render();
  });

  // "Choose this" on a package card fills in the form and moves to it.
  document.querySelectorAll("[data-choose]").forEach((button) => {
    button.addEventListener("click", () => {
      const radio = form.querySelector('input[name="package"][value="' + button.dataset.choose + '"]');
      radio.checked = true;
      render();
      const heading = document.getElementById("estimate-heading");
      heading.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      heading.focus({ preventScroll: true });
    });
  });

  render();

  /* Running costs: Monthly / Yearly ------------------------------------ */
  const costs = document.getElementById("costs-table");
  document.querySelectorAll("[data-period]").forEach((button) => {
    button.addEventListener("click", () => {
      costs.dataset.show = button.dataset.period;
      document.querySelectorAll("[data-period]").forEach((b) => b.setAttribute("aria-pressed", String(b === button)));
    });
  });
  costs.dataset.show = "monthly";
})();
