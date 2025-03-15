<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Administration - Bandeau défilant</title>
  <link rel="stylesheet" href="/styles/common.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
      min-height: 100vh;
      background: #f0f2f5;
      padding: 2rem;
    }

    .admin-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
      background: white;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }

    .admin-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 2px solid #eee;
    }

    .admin-header h1 {
      color: #2c3e50;
      font-size: 1.8rem;
      margin-bottom: 0.5rem;
    }

    .admin-header p {
      color: #666;
      font-size: 0.9rem;
    }

    .message-form {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
      margin-bottom: 2rem;
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .form-group label {
      font-weight: 600;
      color: #2c3e50;
    }

    .form-group textarea {
      padding: 1rem;
      border: 1px solid #ddd;
      border-radius: 6px;
      min-height: 120px;
      font-family: inherit;
      font-size: 0.95rem;
      resize: vertical;
      transition: border-color 0.2s;
    }

    .form-group textarea:focus {
      outline: none;
      border-color: #5eb3ec;
      box-shadow: 0 0 0 2px rgba(94, 179, 236, 0.1);
    }

    .message-preview {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 6px;
      margin-bottom: 1.5rem;
    }

    .preview-header {
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.5rem;
    }

    .preview-content {
      padding: 1rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      color: #666;
      min-height: 3rem;
    }

    .button-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .btn {
      padding: 0.8rem 1.5rem;
      border: none;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .btn-primary {
      background: #5eb3ec;
      color: white;
    }

    .btn-secondary {
      background: #e9ecef;
      color: #2c3e50;
    }

    .btn:hover {
      transform: translateY(-1px);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }

    .btn:active {
      transform: translateY(0);
    }

    .status-message {
      margin-top: 1rem;
      padding: 1rem;
      border-radius: 6px;
      display: none;
    }

    .status-success {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
      display: block;
    }

    .status-error {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
      display: block;
    }

    @media (max-width: 768px) {
      body {
        padding: 1rem;
      }

      .admin-container {
        padding: 1.5rem;
      }

      .admin-header h1 {
        font-size: 1.5rem;
      }

      .button-group {
        flex-direction: column;
      }

      .btn {
        width: 100%;
        text-align: center;
      }
    }

    .preview-ticker {
      overflow: hidden;
      background: rgba(44, 62, 80, 0.9);
      padding: 0.8rem;
      border-radius: 4px;
      margin-top: 1rem;
    }

    .preview-ticker-content {
      color: white;
      white-space: nowrap;
      animation: preview-ticker 20s linear infinite;
      display: inline-block;
    }

    @keyframes preview-ticker {
      0% {
        transform: translateX(100%);
      }

      100% {
        transform: translateX(-100%);
      }
    }

    .speed-control {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .speed-slider {
      flex: 1;
      height: 8px;
      -webkit-appearance: none;
      appearance: none;
      background: #ddd;
      border-radius: 4px;
      outline: none;
    }

    .speed-slider::-webkit-slider-thumb {
      -webkit-appearance: none;
      appearance: none;
      width: 20px;
      height: 20px;
      background: #5eb3ec;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
    }

    .speed-slider::-moz-range-thumb {
      width: 20px;
      height: 20px;
      background: #5eb3ec;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
    }

    .speed-slider::-webkit-slider-thumb:hover {
      background: #4a90c5;
    }

    /* Styles pour le sélecteur d'emoji */
    .emoji-picker {
      display: none;
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      width: 320px;
      max-height: 400px;
      z-index: 1000;
    }

    .emoji-picker.active {
      display: block;
    }

    .emoji-picker-header {
      padding: 10px;
      border-bottom: 1px solid #eee;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .emoji-search {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 14px;
    }

    .btn-close {
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      padding: 0 5px;
    }

    .emoji-categories {
      display: flex;
      overflow-x: auto;
      padding: 10px;
      border-bottom: 1px solid #eee;
    }

    .emoji-categories button {
      background: none;
      border: none;
      padding: 5px 10px;
      cursor: pointer;
      font-size: 20px;
    }

    .emoji-categories button:hover {
      background: #f0f0f0;
      border-radius: 4px;
    }

    .emoji-list {
      padding: 10px;
      display: grid;
      grid-template-columns: repeat(8, 1fr);
      gap: 5px;
      max-height: 300px;
      overflow-y: auto;
    }

    .emoji-list button {
      background: none;
      border: none;
      font-size: 20px;
      padding: 5px;
      cursor: pointer;
      border-radius: 4px;
    }

    .emoji-list button:hover {
      background: #f0f0f0;
    }
  </style>
</head>

<body>
  <button id="backButton" class="back-button">← Retour</button>
  <script src="/js/auth-check.js"></script>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Administration du Bandeau Défilant</h1>
      <p>
        Gérez ici le contenu du bandeau défilant qui apparaît en bas de la
        page principale
      </p>
    </header>

    <form class="message-form" id="messageForm">
      <div class="form-group">
        <label for="tickerMessage">Message du bandeau</label>
        <textarea id="tickerMessage" placeholder="Saisissez votre message ici..." maxlength="500"></textarea>
      </div>

      <div class="form-group">
        <label for="scrollSpeed">Vitesse de défilement</label>
        <div class="speed-control">
          <input type="range" id="scrollSpeed" min="10" max="60" value="30" class="speed-slider">
          <span id="speedValue">30 secondes</span>
        </div>
      </div>

      <div class="form-group">
        <label>Ajouter des emoji</label>
        <button type="button" id="emojiButton" class="btn btn-secondary">
          😊 Choisir un emoji
        </button>
        <div id="emojiPicker" class="emoji-picker">
          <div class="emoji-picker-header">
            <input type="text" id="emojiSearch" placeholder="Rechercher un emoji..." class="emoji-search">
            <button type="button" class="btn-close" id="closeEmojiPicker">&times;</button>
          </div>
          <div class="emoji-categories">
            <button data-category="smileys">😊</button>
            <button data-category="people">👋</button>
            <button data-category="animals">🐶</button>
            <button data-category="food">🍎</button>
            <button data-category="activities">⚽</button>
            <button data-category="travel">🚗</button>
            <button data-category="objects">💡</button>
            <button data-category="symbols">❤️</button>
            <button data-category="flags">🏁</button>
          </div>
          <div class="emoji-list" id="emojiList"></div>
        </div>
      </div>

      <div class="message-preview">
        <div class="preview-header">Aperçu du message</div>
        <div class="preview-ticker">
          <div class="preview-ticker-content" id="previewText">
            Le message apparaîtra ici...
          </div>
        </div>
      </div>

      <div class="button-group">
        <button type="submit" class="btn btn-primary">
          Publier le message
        </button>
        <button type="button" class="btn btn-secondary" id="previewBtn">
          Actualiser l'aperçu
        </button>
      </div>
    </form>

    <div class="status-message" id="statusMessage"></div>
  </div>

  <script>
    const messageForm = document.getElementById("messageForm");
    const tickerMessage = document.getElementById("tickerMessage");
    const previewText = document.getElementById("previewText");
    const previewBtn = document.getElementById("previewBtn");
    const statusMessage = document.getElementById("statusMessage");
    const scrollSpeed = document.getElementById("scrollSpeed");
    const speedValue = document.getElementById("speedValue");

    // Mise à jour de l'aperçu en temps réel
    tickerMessage.addEventListener("input", updatePreview);
    previewBtn.addEventListener("click", updatePreview);

    // Gestion séparée du curseur de vitesse
    scrollSpeed.addEventListener("input", async () => {
        const speed = scrollSpeed.value;
        speedValue.textContent = `${speed} secondes`;
        
        try {
            // Mise à jour de la vitesse uniquement
            const response = await fetch('/api/update-speed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ speed: parseInt(speed) })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour de la vitesse');
            }

            // Mise à jour de l'aperçu local
            const previewContent = document.querySelector('.preview-ticker-content');
            if (previewContent) {
                previewContent.style.animation = `preview-ticker ${speed}s linear infinite`;
            }
        } catch (error) {
            console.error('Erreur:', error);
        }
    });

    function updatePreview() {
      const message = tickerMessage.value.trim();
      previewText.textContent = message || "Le message apparaîtra ici...";
      previewText.style.animation = `preview-ticker ${scrollSpeed.value}s linear infinite`;
    }

    // Fonction pour sauvegarder le message
    async function saveMessage(message) {
      try {
        const response = await fetch('/api/save-ticker', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            message,
            speed: parseInt(scrollSpeed.value)
          })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la sauvegarde');
        }

        return true;
      } catch (error) {
        console.error('Erreur:', error);
        return false;
      }
    }

    // Gestionnaire du formulaire
    messageForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const message = tickerMessage.value;
      const success = await saveMessage(message);
      
      if (success) {
        showStatus("Message sauvegardé avec succès !", true);
      } else {
        showStatus("Erreur lors de la sauvegarde du message.", false);
      }
    });

    function showStatus(message, isSuccess) {
      statusMessage.textContent = message;
      statusMessage.className =
        "status-message " + (isSuccess ? "status-success" : "status-error");

      // Cache le message après 5 secondes
      setTimeout(() => {
        statusMessage.style.display = "none";
      }, 5000);
    }

    // Données des emoji par catégorie
    const emojiData = {
      smileys: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘'],
      people: ['👋', '🤚', '🖐', '✋', '🖖', '👌', '🤏', '✌', '🤞', '🫰', '🤟', '🤘', '🤙', '👈', '👉'],
      animals: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔'],
      food: ['🍎', '🍐', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍈', '🍒', '🍑', '🥭', '🍍', '🥥', '🥝'],
      activities: ['⚽', '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸', '🏒', '🏑', '🥍'],
      travel: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎', '🚓', '🚑', '🚒', '🚐', '🛻', '🚚', '🚛', '🚜', '🛵', '🏍'],
      objects: ['💡', '🔦', '🕯', '🪔', '🧯', '🛢', '💸', '💵', '💴', '💶', '💷', '💰', '💳', '💎', '⚖', '🪜'],
      symbols: ['❤', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❤️‍🔥', '❤️‍🩹', '❣', '💕', '💞', '💓'],
      flags: ['🏁', '🚩', '🎌', '🏴', '🏳', '🏳️‍🌈', '🏳️‍⚧️', '🇦🇨', '🇦🇩', '🇦🇪', '🇦🇫', '🇦🇬', '🇦🇮', '🇦🇱', '🇦🇲']
    };

    // Initialisation du sélecteur d'emoji
    document.addEventListener('DOMContentLoaded', () => {
      const emojiButton = document.getElementById('emojiButton');
      const emojiPicker = document.getElementById('emojiPicker');
      const closeEmojiPicker = document.getElementById('closeEmojiPicker');
      const emojiList = document.getElementById('emojiList');
      const emojiSearch = document.getElementById('emojiSearch');
      const tickerMessage = document.getElementById('tickerMessage');
      const categoryButtons = document.querySelectorAll('.emoji-categories button');

      // Fonction pour ajouter un emoji sans perdre le focus
      function addEmoji(emoji) {
        const start = tickerMessage.selectionStart;
        const end = tickerMessage.selectionEnd;
        const text = tickerMessage.value;
        const newText = text.substring(0, start) + emoji + text.substring(end);
        tickerMessage.value = newText;
        
        // Replacer le curseur après l'emoji
        const newCursorPos = start + emoji.length;
        tickerMessage.selectionStart = newCursorPos;
        tickerMessage.selectionEnd = newCursorPos;
        
        // Garder le focus sur le textarea
        tickerMessage.focus();
        
        // Mettre à jour l'aperçu
        updatePreview();
      }

      // Fonction pour afficher les emoji d'une catégorie
      function showEmojiCategory(category) {
        emojiList.innerHTML = '';
        emojiData[category].forEach(emoji => {
          const button = document.createElement('button');
          button.textContent = emoji;
          button.onclick = (e) => {
            e.preventDefault(); // Empêcher la perte de focus
            addEmoji(emoji);
          };
          emojiList.appendChild(button);
        });
      }

      // Empêcher la perte de focus lors de la recherche d'emoji
      emojiSearch.addEventListener('blur', (e) => {
        e.preventDefault();
        setTimeout(() => emojiSearch.focus(), 0);
      });

      // Afficher/masquer le sélecteur d'emoji
      emojiButton.onclick = () => {
        emojiPicker.classList.toggle('active');
        showEmojiCategory('smileys'); // Catégorie par défaut
      };

      closeEmojiPicker.onclick = () => {
        emojiPicker.classList.remove('active');
      };

      // Gestion des catégories
      categoryButtons.forEach(button => {
        button.onclick = () => {
          showEmojiCategory(button.dataset.category);
        };
      });

      // Recherche d'emoji
      emojiSearch.oninput = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const allEmojis = Object.values(emojiData).flat();
        
        emojiList.innerHTML = '';
        allEmojis.forEach(emoji => {
          if (emoji.toLowerCase().includes(searchTerm)) {
            const button = document.createElement('button');
            button.textContent = emoji;
            button.onclick = () => {
              tickerMessage.value += emoji;
              updatePreview();
            };
            emojiList.appendChild(button);
          }
        });
      };

      // Fermer le sélecteur en cliquant en dehors
      document.addEventListener('click', (e) => {
        if (!emojiPicker.contains(e.target) && e.target !== emojiButton) {
          emojiPicker.classList.remove('active');
        }
      });
    });

    // Mise à jour de la vitesse sans sauvegarder le message
    async function updateSpeed(speed) {
      try {
        const response = await fetch('/api/update-speed', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ speed: parseInt(speed) })
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour de la vitesse');
        }

        // Mise à jour de l'aperçu
        const previewContent = document.querySelector('.preview-ticker-content');
        if (previewContent) {
          previewContent.style.animation = `preview-ticker ${speed}s linear infinite`;
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    }

    // Charger la vitesse actuelle au chargement
    async function loadCurrentSpeed() {
      try {
        const response = await fetch('/api/ticker-message');
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.log('Réponse non-JSON reçue');
          return;
        }

        const data = await response.json();
        if (data && data.speed) {
          scrollSpeed.value = data.speed;
          speedValue.textContent = `${data.speed} secondes`;
          updatePreview();
        }
      } catch (error) {
        console.log('Erreur détaillée:', error);
      }
    }

    // Appeler au chargement de la page
    document.addEventListener('DOMContentLoaded', loadCurrentSpeed);

    // Modifier la fonction loadCurrentMessage
    async function loadCurrentMessage() {
        try {
            const response = await fetch('/api/ticker-message');
            if (!response.ok) {
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();
            
            if (data && data.message) {
                // Afficher le message dans le textarea
                document.getElementById('tickerMessage').value = data.message;
                
                // Mettre à jour l'aperçu
                document.getElementById('previewText').textContent = data.message;
                
                // Mettre à jour le curseur de vitesse si disponible
                if (data.speed) {
                    document.getElementById('scrollSpeed').value = data.speed;
                    document.getElementById('speedValue').textContent = `${data.speed} secondes`;
                    
                    // Mettre à jour l'animation de l'aperçu
                    document.getElementById('previewText').style.animation = `preview-ticker ${data.speed}s linear infinite`;
                }
            }
        } catch (error) {
            console.log('Erreur détaillée:', error);
        }
    }

    // Appeler loadCurrentMessage au chargement de la page
    document.addEventListener('DOMContentLoaded', () => {
        loadCurrentMessage();
    });

    document.addEventListener('DOMContentLoaded', () => {
        const backButton = document.getElementById('backButton');
        if (backButton) {
            backButton.addEventListener('click', () => {
                window.history.back(); // Utilise l'historique du navigateur pour revenir à la page précédente
            });
        }
    });
  </script>
</body>

</html>