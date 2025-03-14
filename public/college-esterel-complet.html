<!DOCTYPE html>
<html lang="fr">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Site du Collège de l'Estérel</title>
  <link rel="stylesheet" href="./responsive-page-css.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" />
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/weather-icons/2.0.10/css/weather-icons.min.css" />
  <style>
    /* Styles pour le carrousel de documents */
    .main-content {
      padding: 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      background-color: #f5f5f5;
    }

    .document-viewer {
      width: 100%;
      max-width: 1200px;
      height: calc(100vh - 300px);
      border: none;
      box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
      margin: 20px 0;
      background-color: white;
    }

    .carousel-controls {
      display: flex;
      gap: 15px;
      margin: 10px 0;
    }

    .carousel-controls button {
      padding: 8px 16px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.3s;
    }

    .carousel-controls button:hover {
      background-color: #0056b3;
    }

    .document-info {
      text-align: center;
      margin: 10px 0;
      font-size: 1.1em;
      color: #333;
      background-color: white;
      padding: 10px 20px;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }

    /* Animation pour le texte défilant */
    @keyframes tickerAnimation {
      0% {
        transform: translateX(100%);
      }

      100% {
        transform: translateX(-100%);
      }
    }

    .news-ticker-content span {
      display: inline-block;
      white-space: nowrap;
      animation: tickerAnimation linear infinite;
    }
  </style>
</head>

<body>
  <script src="/js/auth-check.js"></script>
  <header class="header-banner">
    <div class="banner-container">
      <div class="banner-left">
        <h1 class="banner-title">Collège de l'Estérel</h1>
        <div class="banner-date">
          <script>
            const options = {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            };
            document.write(new Date().toLocaleDateString("fr-FR", options));
          </script>
        </div>
        <div class="banner-time" id="current-time"></div>
      </div>

      <div class="banner-center">
        <div class="weather-container">
          <div class="weather-icon">
            <i class="wi"></i>
          </div>
          <div class="weather-info">
            <div class="weather-temp">
              <span class="temp-value"></span>
              <i class="wi wi-thermometer"></i>
            </div>
            <div class="weather-desc"></div>
            <div class="weather-details">
              <span class="humidity">
                <i class="wi wi-humidity"></i>
                <span class="humidity-value"></span>
              </span>
              <span class="wind">
                <i class="wi wi-strong-wind"></i>
                <span class="wind-value"></span>
              </span>
            </div>
          </div>
        </div>
      </div>

      <div class="banner-right">
        <a href="#" class="logo">
          <img src="./assets/img/logo-ministere-education.png" alt="Logo Education national" />
        </a>
        <a href="#" class="logo">
          <img src="./assets/img/Logo-saint-raphaël.png" alt="Logo Saint-Raphaël" />
        </a>
        <a href="#" class="logo">
          <img src="./assets/img/logo-departement.png" alt="Logo Departement" />
        </a>
      </div>
    </div>
  </header>

  <main class="main-content">
    <div class="document-info">
      <span id="current-document-name">Document en cours...</span>
    </div>
    <iframe class="document-viewer" id="documentViewer"></iframe>
    <div class="carousel-controls">
      <button onclick="prevDocument()">Précédent</button>
      <button id="autoPlayBtn" onclick="toggleAutoPlay()">Pause</button>
      <button onclick="nextDocument()">Suivant</button>
    </div>
  </main>

  <footer class="footer">
    <div class="news-ticker">
      <div class="news-ticker-content">
        <span id="ticker-text">Chargement des informations...</span>
      </div>
    </div>
  </footer>

  <script>
    // Fonctions pour la date et l'heure
    function updateTime() {
      const timeElement = document.getElementById("current-time");
      const now = new Date();
      timeElement.textContent = now.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    }

    setInterval(updateTime, 1000);
    updateTime();

    // Configuration de la météo
    const weatherIconMap = {
      "01d": "wi-day-sunny",
      "01n": "wi-night-clear",
      "02d": "wi-day-cloudy",
      "02n": "wi-night-alt-cloudy",
      "03d": "wi-cloud",
      "03n": "wi-cloud",
      "04d": "wi-cloudy",
      "04n": "wi-cloudy",
      "09d": "wi-day-showers",
      "09n": "wi-night-alt-showers",
      "10d": "wi-day-rain",
      "10n": "wi-night-alt-rain",
      "11d": "wi-day-thunderstorm",
      "11n": "wi-night-alt-thunderstorm",
      "13d": "wi-day-snow",
      "13n": "wi-night-alt-snow",
      "50d": "wi-day-fog",
      "50n": "wi-night-fog",
    };

    // Fonction pour récupérer la météo
    async function getWeather() {
      const apiKey = "c58762bad7036389cd0ca8dfc58bda59";
      const city = "Saint-Raphaël,FR";

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric&lang=fr`
        );
        const data = await response.json();

        const iconElement = document.querySelector(".weather-icon i");
        const tempElement = document.querySelector(".temp-value");
        const descElement = document.querySelector(".weather-desc");
        const humidityElement = document.querySelector(".humidity-value");
        const windElement = document.querySelector(".wind-value");

        iconElement.className = `wi ${weatherIconMap[data.weather[0].icon] || "wi-na"
          }`;

        tempElement.textContent = `${Math.round(data.main.temp)}°C`;
        descElement.textContent = data.weather[0].description;
        humidityElement.textContent = `${data.main.humidity}%`;
        windElement.textContent = `${Math.round(data.wind.speed * 3.6)} km/h`;
      } catch (error) {
        console.error("Erreur lors de la récupération de la météo:", error);
      }
    }

    getWeather();
    setInterval(getWeather, 30 * 60 * 1000);

    // Configuration du carrousel de documents
    const documents = [
      {
        name: 'Photos en cuisine',
        url: '/chemin/vers/photo_cuisine.doc'
      },
      {
        name: 'Menu de la cantine',
        url: '/chemin/vers/menu.pdf'
      },
      {
        name: 'Événements à venir',
        url: '/chemin/vers/evenements.pdf'
      },
      {
        name: 'Informations importantes',
        url: '/chemin/vers/infos.pdf'
      }
    ];

    let currentDocIndex = 0;
    let autoPlayInterval = null;
    const autoPlayDelay = 10000; // 10 secondes par document

    function updateViewer() {
      const viewer = document.getElementById('documentViewer');
      const docInfo = document.getElementById('current-document-name');
      const currentDoc = documents[currentDocIndex];

      // Utiliser Google Docs Viewer pour les fichiers PDF et Office
      const encodedUrl = encodeURIComponent(currentDoc.url);
      viewer.src = `https://docs.google.com/viewer?embedded=true&url=${encodedUrl}`;
      docInfo.textContent = currentDoc.name;
    }

    function nextDocument() {
      currentDocIndex = (currentDocIndex + 1) % documents.length;
      updateViewer();
    }

    function prevDocument() {
      currentDocIndex = (currentDocIndex - 1 + documents.length) % documents.length;
      updateViewer();
    }

    function toggleAutoPlay() {
      const autoPlayBtn = document.getElementById('autoPlayBtn');
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
        autoPlayBtn.textContent = 'Lecture';
      } else {
        autoPlayInterval = setInterval(nextDocument, autoPlayDelay);
        autoPlayBtn.textContent = 'Pause';
      }
    }

    // Fonction pour le texte défilant
    function initNewsTicker(text) {
      const tickerElement = document.getElementById('ticker-text');
      tickerElement.textContent = text;
      tickerElement.style.animationDuration = `${text.length * 0.15}s`;
    }

    // Initialisation au chargement de la page
    document.addEventListener('DOMContentLoaded', () => {
      // Initialiser le carrousel
      updateViewer();
      toggleAutoPlay(); // Démarre automatiquement le carrousel

      // Initialiser le ticker
      initNewsTicker("Bienvenue au Collège de l'Estérel - Contact : fterrasson@colleges.var.fr | Tél : 04 XX XX XX XX - © 2024 Collège de l'Estérel Saint-Raphaël");
    });
  </script>
</body>

</html>