const galleryRail = document.querySelector("#thumbnailRail");
const selfieTicketName = document.querySelector("#selfieTicketName");

function countryFlag(destination) {
  const iso = ({ Brasil: "br", Suíça: "ch", Grécia: "gr", Espanha: "es", Argentina: "ar", Egito: "eg", México: "mx", Portugal: "pt", "Reino Unido": "gb", Peru: "pe", Maldivas: "mv", "Estados Unidos": "us", França: "fr", China: "cn", Itália: "it", Japão: "jp" })[destination.country];
  if (!iso) { const symbol = document.createElement("span"); symbol.className = "country-flag country-flag--emoji"; symbol.textContent = "✦"; return symbol; }
  const image = document.createElement("img");
  image.className = "country-flag";
  image.src = `assets/flags/${iso}.svg`;
  image.alt = `Bandeira de ${destination.country}`;
  return image;
}

function syncGallery(destination, fromUser = false) {
  selectDestination(destination, fromUser);
  selfieTicketName.textContent = destination.name.toUpperCase();
  elements.country.replaceChildren(document.createTextNode(`${destination.country.toUpperCase()} `), countryFlag(destination));
  document.querySelectorAll(".gallery-thumb").forEach(button => button.classList.toggle("is-active", button.dataset.id === destination.id));
}

for (const [index, destination] of destinations.entries()) {
  const button = document.createElement("button");
  button.className = "gallery-thumb";
  button.type = "button";
  button.dataset.id = destination.id;
  button.setAttribute("aria-label", `${destination.name}, ${destination.country}`);
  button.innerHTML = `<img src="${destination.image}" alt=""><span class="gallery-thumb-copy"><strong>${destination.name}</strong><small>${destination.country}</small></span>`;
  button.querySelector("small").append(countryFlag(destination));
  button.addEventListener("click", () => syncGallery(destination, true));
  galleryRail.append(button);
}

syncGallery(destinations[0]);
