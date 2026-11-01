// Estimate maths, shared by the Websites page and the Contact page.
// Prices come from src/_data/packages.json, which the page writes into a <script id="packages-data"> tag.
(function () {
  const source = document.getElementById("packages-data");
  if (!source) return;
  const data = JSON.parse(source.textContent);

  // Whole pounds with a comma for thousands, for example £1,000.
  const pounds = (n) => "£" + Math.round(n).toLocaleString("en-GB");

  const findPackage = (id) => data.packages.find((p) => p.id === id);
  const findExtra = (id) => data.extras.find((e) => e.id === id);
  const findOffer = (id) => data.offers.find((o) => o.id === id) || data.offers[0];

  // choice = { pkg: "simple", rescue: "rescue-mid", extras: ["domain", "5h"], offer: "charity" }
  function calculate(choice) {
    const pkg = findPackage(choice.pkg);
    if (!pkg) return null;
    const option = pkg.price_options
      ? pkg.price_options.find((o) => o.id === choice.rescue) || pkg.price_options[0]
      : null;
    const packagePrice = option ? option.price : pkg.price;

    // Offers apply to the package only, never to the extras.
    const offer = findOffer(choice.offer);
    let offerOff = 0;
    if (offer.type === "percent") offerOff = Math.round((packagePrice * offer.value) / 100);
    if (offer.type === "fixed") offerOff = offer.value;
    offerOff = Math.min(offerOff, packagePrice);
    const packageAfter = packagePrice - offerOff;

    const extras = choice.extras.map(findExtra).filter(Boolean);
    const extrasTotal = extras.reduce((sum, e) => sum + e.price, 0);

    const total = packageAfter + extrasTotal;
    const deposit = Math.ceil((total * data.payment.deposit_percent) / 100);

    return { pkg, option, packagePrice, offer, offerOff, packageAfter, extras, extrasTotal, total, deposit, onHandover: total - deposit };
  }

  // Turns a choice into a short code for the Contact link, for example "bigger,domain,5h,charity".
  function toCode(choice) {
    const pkg = findPackage(choice.pkg);
    const parts = [pkg && pkg.price_options ? choice.rescue : choice.pkg, ...choice.extras];
    if (choice.offer && choice.offer !== "none") parts.push(choice.offer);
    return parts.filter(Boolean).join(",");
  }

  // Reads a code back into a choice. Unknown words are ignored.
  function fromCode(code) {
    const choice = { pkg: null, rescue: null, extras: [], offer: "none" };
    String(code || "").split(",").map((s) => s.trim()).forEach((token) => {
      const pkg = findPackage(token);
      if (pkg && !pkg.price_options) choice.pkg = pkg.id;
      data.packages.forEach((p) => {
        if (p.price_options && p.price_options.some((o) => o.id === token)) {
          choice.pkg = p.id;
          choice.rescue = token;
        }
      });
      const extra = findExtra(token);
      if (extra && !choice.extras.some((id) => (extra.excludes || []).includes(id))) choice.extras.push(extra.id);
      if (data.offers.some((o) => o.id === token)) choice.offer = token;
    });
    return choice.pkg ? choice : null;
  }

  // Plain text summary, one line per item.
  function summary(choice) {
    const r = calculate(choice);
    if (!r) return "";
    const name = r.option ? r.pkg.name + " (" + r.option.label + ")" : r.pkg.name;
    const lines = ["Website estimate", "Package: " + name + ", " + pounds(r.packagePrice)];
    if (r.offerOff > 0) lines.push("Offer: " + r.offer.name + ", minus " + pounds(r.offerOff));
    r.extras.forEach((e) => lines.push("Extra: " + e.name + ", " + pounds(e.price) + (e.id === "domain" ? " plus the cost of the address" : "")));
    lines.push("Total: " + pounds(r.total));
    lines.push("To book: " + pounds(r.deposit) + ". At handover: " + pounds(r.onHandover) + ".");
    return lines.join("\n");
  }

  window.Estimate = { data, pounds, calculate, toCode, fromCode, summary };
})();
