// URL de base de l'API local
const apiUrl = 'http://localhost:5678/api/';

// Tableau pour stocker tous les projets récupérés
let allProjects = [];

// Récupère les projets depuis l'API
async function fetchProjects() {
  try {
    // Appel à l'API pour récupérer les "works" (projets)
    const response = await fetch(`${apiUrl}works`);

    // Vérifie si la réponse est correcte (code HTTP 200)
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    // Conversion de la réponse en JSON
    const data = await response.json();
    console.log('Projets récupérés :', data);

    // Stocke les projets dans la variable globale
    allProjects = data;

    // Affiche les projets dans la galerie
    displayProjects(data);
    
  } catch (error) {

    // Affiche une erreur en cas d'échec de la requête
    console.error('Erreur lors de la récupération des projets :', error);
  }
}

// Affiche les projets dans la galerie
function displayProjects(data) {
  const gallery = document.querySelector('.gallery');
  gallery.innerHTML = '';

  // Pour chaque projet, crée un élément <figure> avec image et légende
  data.forEach(project => {
    const figure = document.createElement('figure');

    const img = document.createElement('img');
    img.src = project.imageUrl;
    img.alt = project.title;

    const caption = document.createElement('figcaption');
    caption.textContent = project.title;


    figure.appendChild(img); // Ajoute l'image à la figure
    figure.appendChild(caption); // Ajoute la légende à la figure
    gallery.appendChild(figure); // Ajoute la figure à la galerie
  });
}

// Récupère les catégories depuis l'API
async function fetchCategories() {
  try {
    // Appel à l'API pour récupérer les catégories
    const response = await fetch(`${apiUrl}categories`);
    if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

    const categories = await response.json();
    console.log('Catégories récupérées :', categories);

    // Génère le menu de filtres par catégorie
    generateCategoryMenu(categories);
  } catch (error) {
    console.error('Erreur lors de la récupération des catégories :', error);
  }
}

// Génère dynamiquement les boutons de filtre par catégorie
function generateCategoryMenu(categories) {
  const menu = document.querySelector('.categories');
  menu.innerHTML = '';

  // Crée le bouton "Tous" pour afficher tous les projets
  const allBtn = document.createElement('button');
  allBtn.textContent = 'Tous';
  allBtn.classList.add('category-btn', 'active');
  allBtn.dataset.category = 'Tous';


  // Ajoute un écouteur d'événement pour afficher tous les projets
  allBtn.addEventListener('click', () => {
    displayProjects(allProjects);
    setActiveButton(allBtn);
  });
  menu.appendChild(allBtn);

  // Crée un bouton pour chaque catégorie
  categories.forEach(category => {
    const btn = document.createElement('button');
    btn.textContent = category.name;
    btn.classList.add('category-btn');
    btn.dataset.category = category.name;

    // Ajoute un écouteur pour filtrer les projets par catégorie
    btn.addEventListener('click', () => {
      const filtered = allProjects.filter(project => project.category.name === category.name);
      displayProjects(filtered);
      setActiveButton(btn);
    });
    menu.appendChild(btn);
  });
}

// Active visuellement le bouton sélectionné
function setActiveButton(activeBtn) {

  // Supprime la classe 'active' de tous les boutons
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  // Ajoute la classe 'active' au bouton sélectionné
  activeBtn.classList.add('active');
}

// Initialise l'application au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  await fetchProjects();
  await fetchCategories();
});