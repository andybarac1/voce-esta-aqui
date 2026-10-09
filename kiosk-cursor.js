(function () {
  const root = document.documentElement;
  const hiddenClass = "kiosk-cursor-hidden";
  const idleDelay = 2000;
  let idleTimer = null;

  const style = document.createElement("style");
  style.textContent = `html.${hiddenClass}, html.${hiddenClass} * { cursor: none !important; }`;
  document.head.append(style);

  function hideCursor() {
    root.classList.add(hiddenClass);
  }

  function scheduleHide() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(hideCursor, idleDelay);
  }

  function showCursor(event) {
    if (event.pointerType && event.pointerType !== "mouse") return;
    root.classList.remove(hiddenClass);
    scheduleHide();
  }

  document.addEventListener("pointermove", showCursor, { passive: true });
  document.addEventListener("pointerdown", event => {
    if (event.pointerType === "touch" || event.pointerType === "pen") hideCursor();
  }, { passive: true });
  window.addEventListener("blur", hideCursor);
  scheduleHide();
})();
