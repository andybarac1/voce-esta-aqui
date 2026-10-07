(function () {
  const credits = window.WIKIMEDIA_CREDITS || [];

  function createLink(label, href) {
    const link = document.createElement("a");
    link.textContent = label;
    link.href = href;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    return link;
  }

  function renderList(container) {
    if (!container || container.dataset.rendered === "true") return;
    const fragment = document.createDocumentFragment();
    credits.forEach((credit, index) => {
      const article = document.createElement("article");
      article.className = "credit-entry";

      const number = document.createElement("span");
      number.className = "credit-number";
      number.textContent = String(index + 1).padStart(2, "0");

      const content = document.createElement("div");
      const title = document.createElement("h3");
      title.textContent = credit.destination;
      const work = document.createElement("p");
      work.className = "credit-work";
      work.textContent = credit.work;
      const author = document.createElement("p");
      author.innerHTML = "<strong>AUTOR</strong> ";
      author.append(document.createTextNode(credit.author));
      const links = document.createElement("p");
      links.className = "credit-links";
      links.append(createLink(credit.license, credit.license_url), createLink("PÁGINA DE ORIGEM ↗", credit.source_url));

      content.append(title, work, author, links);
      article.append(number, content);
      fragment.append(article);
    });
    container.append(fragment);
    container.dataset.rendered = "true";
  }

  document.querySelectorAll("[data-credits-list]").forEach(renderList);

  document.querySelectorAll("[data-open-credits]").forEach(button => {
    button.addEventListener("click", event => {
      event.stopPropagation();
      const dialog = document.querySelector("#creditsDialog");
      renderList(dialog?.querySelector("[data-credits-list]"));
      dialog?.showModal();
    });
  });

  document.querySelectorAll("[data-close-credits]").forEach(button => {
    button.addEventListener("click", () => button.closest("dialog")?.close());
  });

  document.querySelectorAll("dialog.credits-dialog").forEach(dialog => {
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close();
    });
  });
})();
