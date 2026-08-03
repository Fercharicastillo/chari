document.querySelectorAll('.home-toc-card[data-available="false"]').forEach((card) => {
    const enlace = card.querySelector("a");

    card.classList.add("is-unavailable");

    if (enlace) {
        enlace.setAttribute("aria-disabled", "true");
        enlace.setAttribute("tabindex", "-1");
        enlace.addEventListener("click", (event) => {
            event.preventDefault();
        });
    }

    if (!card.querySelector(".home-toc-card__availability")) {
        const availabilityCard = document.createElement("span");
        availabilityCard.classList.add("home-toc-card__availability");
        availabilityCard.textContent = "No disponible";
        card.appendChild(availabilityCard);
    }

    const cardtext = card.querySelector(".home-toc-chapter-name-subchapter");

    if (cardtext) {
        cardtext.textContent = "En construcción";
    }
});