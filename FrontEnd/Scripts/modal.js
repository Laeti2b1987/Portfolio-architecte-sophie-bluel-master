document.addEventListener("DOMContentLoaded", () => {
  // Sélection des éléments principaux
  const modal = document.getElementById("modal1");
  const openModalBtn = document.querySelector(".edit-modal-button");
  const closeModalBtn = modal.querySelector(".js-modal-close");
  const galleryContainer = modal.querySelector(".gallery-modal");
  const galleryView = modal.querySelector(".modal-wrapper");
  const addPhotoBtn = modal.querySelector(".add-photo");

  let addPhotoView = null; // Élément de la vue ajout photo
  let allProjects = [];    // Liste des projets chargés depuis l'API

  // Ouvre la modale et charge la galerie
  openModalBtn.addEventListener("click", async (e) => {
    e.preventDefault();
    modal.style.display = "flex";
    modal.setAttribute("aria-hidden", "false");
    galleryView.style.display = "flex";


    // Cache la vue "Ajout photo" si elle existe
    addPhotoView = modal.querySelector(".modal-add-photo");
    if (addPhotoView) addPhotoView.style.display = "none";

    // Charge les projets dans la galerie mod
    await loadGallery();
  });

  // Ferme la modale via la croix
  closeModalBtn.addEventListener("click", closeModal);

  // Ferme la modale en cliquant en dehors
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  // Fonction de fermeture de la modale
  function closeModal() {
    // Retire le focus actif avant de masquer la modale
    if (document.activeElement && modal.contains(document.activeElement)) {
      document.activeElement.blur();
    }

    modal.style.display = "none";
    modal.setAttribute("aria-hidden", "true");

    galleryView.style.display = "flex";

    // Réinitialise la vue "Ajout photo" si elle existe
    if (addPhotoView) {
      const form = addPhotoView.querySelector(".add-photo-form");
      const submitBtn = addPhotoView.querySelector(".submit-photo");

      if (form) form.reset();

      // Supprime les aperçus d'image
      const previews = modal.querySelectorAll(".image-preview");
      previews.forEach(preview => preview.remove());

      // Désactive le bouton de soumission
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.remove("active");
      }

      addPhotoView.style.display = "none";
    }

    // Vide la galerie modale
    galleryContainer.innerHTML = "";
  }


  // Charge les projets depuis l'API et les affiche dans la modale
  async function loadGallery() {
    try {
      const response = await fetch("http://localhost:5678/api/works");
      if (!response.ok) throw new Error(`Erreur HTTP : ${response.status}`);

      const works = await response.json();
      allProjects = works;
      galleryContainer.innerHTML = "";

      // Crée et ajoute chaque projet à la galerie
      works.forEach((work) => {
        const figure = createGalleryItem(work);
        galleryContainer.appendChild(figure);
      });
    } catch (error) {
      console.error("Erreur chargement galerie :", error);
    }
  }

  // Crée un élément <figure> pour un projet avec image et icône de suppression
  function createGalleryItem(work) {
    const figure = document.createElement("figure");
    figure.classList.add("modal-thumbnail");

    const image = document.createElement("img");
    image.src = work.imageUrl;
    image.alt = work.title;

    const deleteIcon = document.createElement("div");
    deleteIcon.classList.add("delete-icon");
    deleteIcon.innerHTML = `<i class="fa-solid fa-trash-can" title="Supprimer"></i>`;


    // Ajoute l'action de suppression au clic sur l'icône
    deleteIcon.addEventListener("click", () => deleteWork(work.id, figure));

    figure.appendChild(image);
    figure.appendChild(deleteIcon);

    return figure;
  }

  // Supprime un projet via l'API
  async function deleteWork(id, figureElement) {
    const token = localStorage.getItem("authToken");
    if (!token) {
      alert("Vous devez être connecté pour supprimer un projet.");
      return;
    }
    
    // Demande confirmation à l'utilisateur
     const confirmDelete = confirm("Êtes-vous sûr de vouloir supprimer ce projet ?");
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:5678/api/works/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {

        // Supprime l'élément visuellement
        figureElement.remove();


        // Met à jour la liste des projets
        allProjects = allProjects.filter(project => project.id !== id);
        displayProjects(allProjects);
      } else {
        alert("Échec de la suppression.");
      }
    } catch (error) {
      console.error("Erreur suppression :", error);
    }
  }

  // Affiche la vue ajout photo
  addPhotoBtn.addEventListener("click", () => {
    galleryView.style.display = "none";
    showAddPhotoView();
  });

  // Crée dynamiquement la vue ajout photo
  function showAddPhotoView() {
    if (addPhotoView) {
      addPhotoView.style.display = "flex";
      return;
    }

    addPhotoView = document.createElement("div");
    addPhotoView.classList.add("modal-add-photo");
    addPhotoView.setAttribute("role", "dialog");
    addPhotoView.setAttribute("aria-modal", "true");


    // Structure HTML du formulaire d'ajout
    addPhotoView.innerHTML = `
      <div class="close-button-container">
        <button class="js-modal-close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <h3 class="titre-modal">Ajout photo</h3>
      <form class="add-photo-form">
        <div class="upload-zone">
          <label class="upload-label">
            <i class="fa-regular fa-image"></i>
            <span>+ Ajouter photo</span>
            <input type="file" accept="image/jpeg, image/png" class="file-input" style="display:none;" required />
          </label>
          <p class="upload-info">jpg, png - 4mo max</p>
        </div>
        <label for="title">Titre</label>
        <input type="text" id="title" name="title" required />
        <label for="category">Catégorie</label>
        <select id="category" name="category" required>
          <option value=""></option>
        </select>
        <hr class="form-separator" />
        <div class="form-actions">
          <button type="submit" class="submit-photo" disabled>Valider</button>
        </div>
      </form>
    `;
    modal.appendChild(addPhotoView);

    // Charge les catégories dans le select
    fetch("http://localhost:5678/api/categories")
      .then(res => res.json())
      .then(categories => {
        const select = addPhotoView.querySelector("#category");
        categories.forEach(cat => {
          const option = document.createElement("option");
          option.value = cat.id;
          option.textContent = cat.name;
          select.appendChild(option);
        });
      });

    // Ferme la vue ajout photo
    addPhotoView.querySelector(".js-modal-close").addEventListener("click", () => {
      addPhotoView.style.display = "none";
      galleryView.style.display = "flex";
    });

    // Gestion du formulaire
    const form = addPhotoView.querySelector(".add-photo-form");
    const fileInput = form.querySelector(".file-input");
    const titleInput = form.querySelector("#title");
    const categorySelect = form.querySelector("#category");
    const submitBtn = form.querySelector(".submit-photo");

    // Aperçu image
    fileInput.addEventListener("change", () => {
      const previewZone = addPhotoView.querySelector(".upload-zone");
      const existingPreview = previewZone.querySelector(".image-preview");
      if (existingPreview) existingPreview.remove();

      const file = fileInput.files[0];
      if (file) {
        const preview = document.createElement("img");
        preview.src = URL.createObjectURL(file);
        preview.classList.add("image-preview");
        previewZone.appendChild(preview);
      }

      checkFormValidity();
    });


    // Vérifie la validité du formulaire à chaque modification
    [titleInput, categorySelect].forEach(input => {
      input.addEventListener("input", checkFormValidity);
    });

    function checkFormValidity() {
      const isValid =
        fileInput.files.length > 0 &&
        titleInput.value.trim() !== "" &&
        categorySelect.value !== "";

      submitBtn.disabled = !isValid;
      submitBtn.classList.toggle("active", isValid);
    }

    // Soumission du formulaire d'ajout
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      submitBtn.disabled = true;

      const title = titleInput.value.trim();
      const category = categorySelect.value;
      const file = fileInput.files[0];
      const token = localStorage.getItem("authToken");

      if (!file || !title || !category) {
        alert("Veuillez remplir tous les champs.");
        submitBtn.disabled = false;
        return;
      }

      const formData = new FormData();
      formData.append("image", file);
      formData.append("title", title);
      formData.append("category", category);

      try {
        const response = await fetch("http://localhost:5678/api/works", {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData
        });

        if (response.ok) {
          const newWork = await response.json();


          // Réinitialise le formulaire et l'aperçu
          form.reset();
          const preview = addPhotoView.querySelector(".image-preview");
          if (preview) preview.remove();
          submitBtn.classList.remove("active");

          // Affiche un message de confirmation
          alert("Projet ajouté avec succès !")

          // Retourne à la vue galerie
          addPhotoView.style.display = "none";
          galleryView.style.display = "flex";

          // Recharge les projets et met à jour l'affichage
          const updatedResponse = await fetch("http://localhost:5678/api/works");
          const updatedProjects = await updatedResponse.json();
          allProjects = updatedProjects;
          displayProjects(updatedProjects);

          await loadGallery();
        } else {
          alert("Erreur lors de l'ajout.");
        }
      } catch (error) {
        console.error("Erreur API :", error);
      }
    });
  }
});