// Exécute le code une fois que le DOM est complètement chargé
document.addEventListener("DOMContentLoaded", () => {

  // Récupère le token d'authentification depuis le localStorage
  const token = localStorage.getItem("authToken");

  // Sélectionne les éléments HTML nécessaires
  const editSection = document.getElementById("editButtons"); // Section contenant les boutons d'édition
  const authLink = document.getElementById("authLink"); // Lien de connexion/déconnexion


  // Si un token est présent, l'utilisateur est connecté
  if (token) {

    // Crée une bannière "Mode édition" en haut de la page
    const banner = document.createElement("div");
    banner.classList.add("edition-banner");
    banner.innerHTML = `<i class="fa-regular fa-pen-to-square"></i><span>Mode édition</span>`;
    document.body.prepend(banner); // Ajoute la bannière en haut du body

    //Affiche le bouton "modifier" 
    editSection?.classList.remove("hidden");

    //Change le lien de connexion en déconnexion
    authLink.innerHTML = `<a href="#" id="logoutButton">logout</a>`;

    // Gère la déconnexion
    document.getElementById("logoutButton").addEventListener("click", (e) => {
      e.preventDefault();

      // Supprime le token du localStorage et recharge la page
      localStorage.removeItem("authToken");
      window.location.reload();
    });
  } else {
    // Si aucun token, l'utilisateur n'est pas connecté : on masque les boutons d'édition
    editSection?.classList.add("hidden");
  }
});