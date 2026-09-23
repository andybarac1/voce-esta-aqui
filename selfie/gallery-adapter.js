const galleryRail = document.querySelector("#thumbnailRail");
const selfieTicketName = document.querySelector("#selfieTicketName");

function countryFlag(destination) {
  const region = destination.code.split(" / ")[1]?.toLowerCase();
  const image = document.createElement("img");
  image.className = "country-flag";
  image.src = `assets/flags/${region}.svg`;
  image.alt = `Bandeira de ${destination.country}`;
  return image;
}

function syncGallery(destination, fromUser = false) {
  selectDestination(destination, fromUser);
  selfieTicketName.textContent = destination.name.toUpperCase();
  elements.country.replaceChildren(document.createTextNode(`${destination.country.toUpperCase()} `), countryFlag(destination));
  document.querySelectorAll(".gallery-thumb").forEach(button => button.classList.toggle("is-active", button.dataset.id === destination.id));
  document.querySelector(`.gallery-thumb[data-id="${destination.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
}

for (const [index, destination] of destinations.entries()) {
  const button = document.createElement("button");
  button.className = "gallery-thumb";
  button.type = "button";
  button.dataset.id = destination.id;
  button.setAttribute("aria-label", `${destination.name}, ${destination.country}`);
  button.innerHTML = `<img src="${destination.image}" alt=""><span>${String(index + 1).padStart(2, "0")}</span>`;
  button.addEventListener("click", () => syncGallery(destination, true));
  galleryRail.append(button);
}

syncGallery(destinations[0]);
