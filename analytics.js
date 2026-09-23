(function () {
  const measurementId = "G-7ZKKGGG67V";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  window.gtag("js", new Date());
  window.gtag("config", measurementId, {
    cookie_flags: "SameSite=None;Secure",
    send_page_view: true
  });

  const tag = document.createElement("script");
  tag.async = true;
  tag.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  document.head.append(tag);

  const path = location.pathname;
  const experience = path.includes("/polaroid") || path.includes("/experiencia-2") ? "polaroid" : "selfie";
  const surface = document.body.classList.contains("mobile-page") ? "mobile" : "tv";
  const sent = new Set();

  function track(name, parameters = {}, onceKey = "") {
    if (onceKey && sent.has(onceKey)) return;
    if (onceKey) sent.add(onceKey);
    window.gtag("event", name, { experience, surface, ...parameters });
  }

  function onClick(selector, name, parameters) {
    document.querySelector(selector)?.addEventListener("click", event => {
      const values = typeof parameters === "function" ? parameters(event) : parameters;
      track(name, values || {});
    });
  }

  onClick("#openingSplash", "experience_start");
  onClick("#scenarioPromptButton", "selfie_scene_confirm");
  onClick("#readyPromptButton", "selfie_countdown_start");
  onClick("#restartButton", "experience_restart");
  onClick("#chooseButton", "qr_display", () => ({ destination_id: window.selected?.id || document.querySelector(".map-pin.is-active")?.dataset.id || "unknown" }));
  onClick("#reasonContinue", "caption_complete");
  onClick("#shareButton", "share", () => ({ method: "native_share" }));
  onClick("#downloadButton", "file_download", () => ({ file_type: "image/jpeg" }));
  onClick("#finishButton", "experience_complete");

  document.querySelectorAll(".gallery-thumb, .map-pin").forEach(destination => {
    destination.addEventListener("click", () => track("destination_select", { destination_id: destination.dataset.id }));
  });

  for (const input of [document.querySelector("#cameraInput"), document.querySelector("#galleryInput")]) {
    input?.addEventListener("change", () => {
      if (input.files?.length) track("photo_selected", { source: input.id === "cameraInput" ? "camera" : "gallery" });
    });
  }

  const editor = document.querySelector("#editorStep");
  if (editor) {
    new MutationObserver(() => {
      if (!editor.hidden) track("polaroid_ready", {}, "polaroid_ready");
    }).observe(editor, { attributes: true, attributeFilter: ["hidden"] });
  }

  const selfieEnd = document.querySelector("#phoneEnd");
  if (selfieEnd) {
    new MutationObserver(() => {
      if (!selfieEnd.hidden) track("selfie_complete", {}, "selfie_complete");
    }).observe(selfieEnd, { attributes: true, attributeFilter: ["hidden"] });
  }
})();
