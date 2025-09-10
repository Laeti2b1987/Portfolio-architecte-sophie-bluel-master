// URL de l'API de connexion
const loginApi = "http://localhost:5678/api/users/login";

// Ajout d'un écouteur d'événement sur le formulaire de connexion
document.getElementById("loginform").addEventListener('submit', handleSubmit);

// Fonction appelée lors de la soumission du formulaire
async function handleSubmit(event) {
  // Empêche le rechargement de la page lors de la soumission
  event.preventDefault();

  // Récupération des champs email et mot de passe  
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const email = emailInput.value.trim(); // Supprime les espaces inutiles
  const password = passwordInput.value.trim();

  // Validation du champ email avec une expression régulière
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError("Veuillez entrer un email valide.");
    return;
  }

  // Validation du mot de passe : minimum 4 caractères
  if (!password || password.length < 4) {
    showError("Le mot de passe doit contenir au moins 4 caractères.");
    return;
  }

  // Création de l'objet utilisateur à envoyer à l'API
  const user = { email, password };

  try {
    // Envoi de la requête POST à l'API de connexion
    const response = await fetch(loginApi, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });

    // Vérifie si la réponse est un succès (code 200) 
    if (response.status !== 200) {
      showError("Veuillez vérifier votre email ou votre mot de passe.");
      return;
    }

    // Récupération du token depuis la réponse
    const result = await response.json();
    const token = result.token;

    // Stockage du token dans le localStorage pour les futures requêtes
    localStorage.setItem("authToken", token);

    // Redirection vers la page d'accueil après une connexion réussie
    window.location.href = "index.html";
  } catch (error) {
    // Gestion des erreurs réseau ou autres exception
    console.error("Erreur réseau :", error);
    showError("Une erreur est survenue. Veuillez réessayer plus tard.");
  }
}


// Fonction pour afficher un message d'erreur dans le formulaire
function showError(message) {
  // Supprime le message d'erreur existant s'il y en a un
  const existingError = document.querySelector(".error-login");
  if (existingError) existingError.remove();

  // Création d'un nouvel élément pour afficher l'erreur
  const errorBox = document.createElement("div");
  errorBox.className = "error-login"; 
  errorBox.textContent = message;

  // Ajout du message d'erreur en haut du formulaire
  document.querySelector("form").prepend(errorBox);
}


