async function validateLogin(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('error-message');

    try {
        console.log('Tentative de connexion...');
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({ username, password }),
            credentials: 'same-origin'
        });

        console.log('Status de la réponse:', response.status);

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Erreur de connexion:', errorData);
            errorMessage.textContent = 'Erreur d\'authentification. Veuillez réessayer.';
            errorMessage.style.display = 'block';
            return;
        }

        let data;
        try {
            data = await response.json();
            console.log('Données reçues:', data);
        } catch (jsonError) {
            console.error('Erreur parsing JSON:', jsonError);
            errorMessage.textContent = 'Erreur de communication avec le serveur';
            errorMessage.style.display = 'block';
            return;
        }

        if (response.status === 429) {
            errorMessage.textContent = 'Trop de tentatives. Veuillez patienter quelques minutes.';
            errorMessage.style.display = 'block';
            return;
        }

        console.log('Connexion réussie:', data);
        window.location.href = '/navigation.html';
    } catch (error) {
        console.error('Erreur complète:', error);
        const errorMsg = error.name === 'TypeError' && !navigator.onLine
            ? 'Vérifiez votre connexion internet'
            : 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';

        errorMessage.textContent = errorMsg;
        errorMessage.style.display = 'block';
    }
}

function logout() {
    fetch('/api/logout', {
        method: 'POST',
        credentials: 'same-origin'
    }).then(() => {
        window.location.href = '/index.html';
    });
} 