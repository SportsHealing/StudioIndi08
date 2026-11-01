// Shows the estimate sent from the Websites page, for example /contact/?estimate=bigger,domain,5h,charity
(function () {
  const E = window.Estimate;
  if (!E) return;
  const choice = E.fromCode(new URLSearchParams(location.search).get("estimate"));
  if (!choice) return;

  const text = E.summary(choice);
  document.getElementById("estimate-text").textContent = text;
  document.getElementById("estimate-box").hidden = false;

  const status = document.getElementById("copy-status");
  document.getElementById("copy-estimate").addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = "Copied. Paste it into your message.";
    } catch (error) {
      status.textContent = "Could not copy. Select the text above and copy it yourself.";
    }
  });
})();
