let currentColor = '#000000';
let isDrawing = false;
let frames = [[]];
let currentFrame = 0;
let isErasing = false; // Pour la gomme
let modifiedPixels = [new Set()]; // Pour suivre les pixels modifiés
let clipboard = null; // Pour le copier-coller
let copiedFrame = null;

// Initialisation de la grille
function initGrid() {
    const grid = document.getElementById('pixelGrid');
    for (let i = 0; i < 32 * 32; i++) {
        const pixel = document.createElement('div');
        pixel.className = 'pixel empty';
        pixel.addEventListener('mousedown', startDrawing);
        pixel.addEventListener('mouseover', draw);
        pixel.addEventListener('mouseup', stopDrawing);
        grid.appendChild(pixel);
    }
    
    grid.addEventListener('mousedown', e => e.preventDefault());
}

// Fonctions de dessin
function startDrawing(e) {
    isDrawing = true;
    draw(e);
}

function draw(e) {
    if (!isDrawing) return;
    if (e.target.classList.contains('pixel')) {
        if (isErasing) {
            // Mode gomme
            e.target.style.backgroundColor = '#FFFFFF';
            e.target.classList.add('empty');
        } else {
            // Mode dessin normal
            e.target.style.backgroundColor = currentColor;
            e.target.classList.remove('empty');
        }
        saveCurrentFrame();
    }
}

function stopDrawing() {
    isDrawing = false;
}

// Gestion des couleurs
function initColorPicker() {
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('change', (e) => {
        currentColor = e.target.value;
        isErasing = false;
        document.getElementById('eraserBtn')?.classList.remove('active');
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            currentColor = btn.style.backgroundColor;
            colorPicker.value = rgbToHex(currentColor);
        });
    });
}

// Gestion des frames
function saveCurrentFrame() {
    const pixels = document.querySelectorAll('.pixel');
    const frameData = Array.from(pixels).map(pixel => ({
        color: pixel.style.backgroundColor || '#FFFFFF',
        isEmpty: pixel.classList.contains('empty')
    }));
    frames[currentFrame] = frameData;
}

function loadFrame(frameIndex) {
    if (!frames[frameIndex]) return;
    
    const pixels = document.querySelectorAll('.pixel');
    
    // Nettoyer tous les points rouges existants
    document.querySelectorAll('.previous-pixel-marker').forEach(marker => marker.remove());
    
    // Réinitialiser les pixels
    pixels.forEach(pixel => {
        pixel.style.backgroundColor = '#FFFFFF';
        pixel.classList.add('empty');
    });
    
    // Afficher la frame actuelle
    frames[frameIndex].forEach((pixel, i) => {
        if (!pixel.isEmpty) {
            pixels[i].style.backgroundColor = pixel.color;
            pixels[i].classList.remove('empty');
        }
    });
    
    // Ajouter les points rouges uniquement pour la frame précédente
    if (frameIndex > 0 && frames[frameIndex - 1]) {
        frames[frameIndex - 1].forEach((pixel, i) => {
            if (!pixel.isEmpty) {
                const marker = document.createElement('div');
                marker.className = 'previous-pixel-marker';
                pixels[i].appendChild(marker);
            }
        });
    }
    
    currentFrame = frameIndex;
    updateFramesList();
}

function addFrame() {
    saveCurrentFrame();
    frames.push([]);
    currentFrame = frames.length - 1;
    loadFrame(currentFrame);
}

function updateFramesList() {
    const framesList = document.getElementById('framesList');
    framesList.innerHTML = '';
    
    frames.forEach((frame, index) => {
        const frameContainer = document.createElement('div');
        frameContainer.className = 'frame-container';
        
        const insertBeforeBtn = document.createElement('button');
        insertBeforeBtn.textContent = '+';
        insertBeforeBtn.className = 'insert-frame-btn';
        insertBeforeBtn.title = 'Insérer une frame ici';
        insertBeforeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            insertFrame(index);
        });
        
        const frameBtn = document.createElement('button');
        frameBtn.textContent = `Frame ${index + 1}`;
        frameBtn.className = `frame-preview ${index === currentFrame ? 'active' : ''}`;
        frameBtn.draggable = true; // Rendre l'élément déplaçable
        
        // Ajouter les événements de drag & drop
        frameBtn.addEventListener('dragstart', (e) => {
            e.dataTransfer.setData('text/plain', index);
            frameBtn.classList.add('dragging');
        });
        
        frameBtn.addEventListener('dragend', () => {
            frameBtn.classList.remove('dragging');
        });
        
        frameBtn.addEventListener('dragover', (e) => {
            e.preventDefault();
            frameBtn.classList.add('drag-over');
        });
        
        frameBtn.addEventListener('dragleave', () => {
            frameBtn.classList.remove('drag-over');
        });
        
        frameBtn.addEventListener('drop', (e) => {
            e.preventDefault();
            frameBtn.classList.remove('drag-over');
            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = index;
            
            if (fromIndex !== toIndex) {
                reorderFrames(fromIndex, toIndex);
            }
        });
        
        frameBtn.addEventListener('click', () => {
            currentFrame = index;
            loadFrame(currentFrame);
        });
        
        frameContainer.appendChild(insertBeforeBtn);
        frameContainer.appendChild(frameBtn);
        framesList.appendChild(frameContainer);
    });
    
    // Bouton d'insertion après la dernière frame
    const insertLastBtn = document.createElement('button');
    insertLastBtn.textContent = '+';
    insertLastBtn.className = 'insert-frame-btn';
    insertLastBtn.title = 'Ajouter une frame à la fin';
    insertLastBtn.addEventListener('click', () => insertFrame(frames.length));
    framesList.appendChild(insertLastBtn);
}

// Ajouter la fonction insertFrame
function insertFrame(index) {
    saveCurrentFrame(); // Sauvegarder la frame actuelle avant l'insertion
    
    // Créer une nouvelle frame vide
    const newFrame = Array(32 * 32).fill().map(() => ({
        color: '#FFFFFF',
        isEmpty: true
    }));
    
    // Insérer la nouvelle frame à l'index spécifié
    frames.splice(index, 0, newFrame);
    currentFrame = index;
    loadFrame(currentFrame);
    updateFramesList();
}

// Ajouter la fonction deleteCurrentFrame
function deleteCurrentFrame() {
    if (frames.length <= 1) {
        alert('Impossible de supprimer la dernière frame !');
        return;
    }
    
    if (confirm(`Voulez-vous vraiment supprimer la frame ${currentFrame + 1} ?`)) {
        frames.splice(currentFrame, 1);
        if (currentFrame >= frames.length) {
            currentFrame = frames.length - 1;
        }
        loadFrame(currentFrame);
        updateFramesList();
    }
}

// Ajouter la fonction clearAllFrames
function clearAllFrames() {
    if (confirm('Êtes-vous sûr de vouloir effacer toutes les frames ?')) {
        frames = [[]];  // Réinitialiser avec une seule frame vide
        currentFrame = 0;
        
        // Effacer tous les pixels
        const pixels = document.querySelectorAll('.pixel');
        pixels.forEach(pixel => {
            pixel.style.backgroundColor = '#FFFFFF';
            pixel.classList.add('empty');
        });

        // Nettoyer les marqueurs
        document.querySelectorAll('.previous-pixel-marker').forEach(marker => marker.remove());

        // Mettre à jour l'interface
        updateFramesList();
        loadFrame(currentFrame);
    }
}

// Ajouter la fonction toggleEraser
function toggleEraser() {
    isErasing = !isErasing;
    const eraserBtn = document.getElementById('eraserBtn');
    eraserBtn.classList.toggle('active');
    document.getElementById('pixelGrid').classList.toggle('eraser-mode');
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    initGrid();
    initColorPicker();
    
    // Ajouter le bouton gomme
    const eraserBtn = document.createElement('button');
    eraserBtn.textContent = 'Gomme';
    eraserBtn.id = 'eraserBtn';
    eraserBtn.addEventListener('click', toggleEraser);
    
    // L'ajouter après le color picker
    const colorPicker = document.getElementById('colorPicker');
    colorPicker.parentNode.insertBefore(eraserBtn, colorPicker.nextSibling);
    
    // Désactiver la gomme quand on change de couleur
    colorPicker.addEventListener('change', (e) => {
        currentColor = e.target.value;
        isErasing = false;
        eraserBtn.classList.remove('active');
        document.getElementById('pixelGrid').classList.remove('eraser-mode');
    });
    
    const deleteFrameBtn = document.createElement('button');
    deleteFrameBtn.textContent = 'Supprimer la frame';
    deleteFrameBtn.id = 'deleteFrameBtn';
    deleteFrameBtn.addEventListener('click', deleteCurrentFrame);
    
    const clearBtn = document.getElementById('clearBtn');
    clearBtn.parentNode.insertBefore(deleteFrameBtn, clearBtn.nextSibling);
    
    // Utiliser la nouvelle fonction clearAllFrames
    document.getElementById('clearBtn').addEventListener('click', clearAllFrames);
    
    document.getElementById('addFrameBtn').addEventListener('click', addFrame);
    document.getElementById('previewBtn').addEventListener('click', previewAnimation);
    
    // Ajouter les boutons copier/coller dans la barre d'outils
    const copyFrameBtn = document.createElement('button');
    copyFrameBtn.textContent = 'Copier la frame';
    copyFrameBtn.id = 'copyFrameBtn';
    copyFrameBtn.addEventListener('click', copyCurrentFrame);
    
    const pasteFrameBtn = document.createElement('button');
    pasteFrameBtn.textContent = 'Coller la frame';
    pasteFrameBtn.id = 'pasteFrameBtn';
    pasteFrameBtn.disabled = true; // Désactivé par défaut
    pasteFrameBtn.addEventListener('click', pasteFrame);
    
    // Ajouter les boutons dans la barre d'outils
    const tools = document.querySelector('.tools');
    tools.appendChild(copyFrameBtn);
    tools.appendChild(pasteFrameBtn);
    
    // Ajouter le bouton crédits
    const creditsBtn = document.createElement('button');
    creditsBtn.textContent = 'Crédits';
    creditsBtn.id = 'creditsBtn';
    creditsBtn.addEventListener('click', showCredits);
    
    // L'ajouter à la fin de la barre d'outils
    tools.appendChild(creditsBtn);
    
    loadFrame(0);
    updateFramesList();
    
    // Modifier l'événement du bouton de sauvegarde
    document.getElementById('saveBtn').addEventListener('click', saveToFile);
});

async function saveToFile() {
    try {
        // Demander le nom du fichier avec une boîte de dialogue personnalisée
        const fileName = await showSaveDialog();
        if (!fileName) return; // Si l'utilisateur annule

        const data = {
            name: fileName,
            frames: frames,
            currentFrame: currentFrame,
            dateCreated: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        // Utiliser la boîte de dialogue système de sauvegarde
        const handle = await window.showSaveFilePicker({
            suggestedName: `${fileName}.json`,
            types: [{
                description: 'Fichier Pixel Art',
                accept: {
                    'application/json': ['.json'],
                },
            }],
        });

        const writable = await handle.createWritable();
        await writable.write(JSON.stringify(data, null, 2));
        await writable.close();

        alert('Projet sauvegardé avec succès !');
    } catch (err) {
        console.error('Erreur lors de la sauvegarde:', err);
        alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
    }
}

function showSaveDialog() {
    return new Promise((resolve) => {
        const dialog = document.createElement('div');
        dialog.className = 'save-dialog';
        dialog.innerHTML = `
            <div class="save-dialog-content">
                <h3>Sauvegarder le projet</h3>
                <input type="text" id="saveFileName" placeholder="Nom du fichier" value="mon-pixel-art">
                <div class="dialog-buttons">
                    <button id="dialogSave">Sauvegarder</button>
                    <button id="dialogCancel">Annuler</button>
                </div>
            </div>
        `;

        document.body.appendChild(dialog);

        const input = dialog.querySelector('#saveFileName');
        const saveBtn = dialog.querySelector('#dialogSave');
        const cancelBtn = dialog.querySelector('#dialogCancel');

        saveBtn.onclick = () => {
            const value = input.value.trim();
            if (value) {
                document.body.removeChild(dialog);
                resolve(value);
            }
        };

        cancelBtn.onclick = () => {
            document.body.removeChild(dialog);
            resolve(null);
        };

        input.focus();
    });
}

function loadFromFile() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                frames = data.frames;
                currentFrame = data.currentFrame;
                
                // Afficher le nom du fichier chargé
                const title = document.getElementById('projectTitle');
                if (title) {
                    title.textContent = data.name || 'Projet sans nom';
                }
                
                updateFramesList();
                loadFrame(currentFrame);
            } catch (error) {
                alert('Erreur lors du chargement du fichier : ' + error.message);
            }
        };
        reader.readAsText(file);
    };
    input.click();
}

// Prévisualisation de l'animation
function previewAnimation() {
    let frameIndex = 0;
    const interval = setInterval(() => {
        // Nettoyer les points rouges pendant l'animation
        document.querySelectorAll('.previous-pixel-marker').forEach(marker => marker.remove());
        
        const pixels = document.querySelectorAll('.pixel');
        frames[frameIndex].forEach((pixel, i) => {
            pixels[i].style.backgroundColor = pixel.isEmpty ? '#FFFFFF' : pixel.color;
            // Ne pas montrer les points noirs pendant l'animation
            pixels[i].classList.remove('empty');
        });
        
        frameIndex = (frameIndex + 1) % frames.length;
        
        if (frameIndex === 0) {
            clearInterval(interval);
            loadFrame(currentFrame);
        }
    }, 200);
}

// Utilitaires
function rgbToHex(rgb) {
    if (!rgb || rgb === 'white') return '#FFFFFF';
    const values = rgb.match(/\d+/g);
    return `#${values.map(x => parseInt(x).toString(16).padStart(2, '0')).join('')}`;
}

// Ajouter ces styles CSS directement dans le JavaScript
const styleSheet = document.createElement('style');
styleSheet.textContent = `
#pixelGrid {
    position: relative;
    display: grid;
    grid-template-columns: repeat(32, 22px);
    grid-template-rows: repeat(32, 22px);
    gap: 1px;
    background-color: #ddd;
    padding: 1px;
    border: 1px solid #999;
}

.main-grid {
    display: grid;
    grid-template-columns: repeat(32, 1fr);
    grid-template-rows: repeat(32, 1fr);
    gap: 1px;
    position: relative;
    z-index: 1;
}

.frame-overlay {
    position: absolute;
    top: 1px;
    left: 1px;
    right: 1px;
    bottom: 1px;
    display: grid;
    grid-template-columns: repeat(32, 1fr);
    grid-template-rows: repeat(32, 1fr);
    gap: 1px;
    pointer-events: none;
    z-index: 2;
}

.pixel, .overlay-pixel {
    width: 100%;
    height: 100%;
    background-color: white;
    transition: background-color 0.1s;
}

.overlay-pixel {
    transition: opacity 0.2s;
}
`;
document.head.appendChild(styleSheet);

// Ajouter la fonction reorderFrames
function reorderFrames(fromIndex, toIndex) {
    // Sauvegarder la frame déplacée
    const frameToMove = frames[fromIndex];
    
    // Supprimer la frame de son emplacement d'origine
    frames.splice(fromIndex, 1);
    
    // Insérer la frame à sa nouvelle position
    frames.splice(toIndex, 0, frameToMove);
    
    // Mettre à jour l'index courant si nécessaire
    if (currentFrame === fromIndex) {
        currentFrame = toIndex;
    } else if (currentFrame > fromIndex && currentFrame <= toIndex) {
        currentFrame--;
    } else if (currentFrame < fromIndex && currentFrame >= toIndex) {
        currentFrame++;
    }
    
    // Mettre à jour l'interface
    loadFrame(currentFrame);
    updateFramesList();
}

// Ajouter la fonction copyCurrentFrame
function copyCurrentFrame() {
    copiedFrame = JSON.parse(JSON.stringify(frames[currentFrame]));
    document.getElementById('pasteFrameBtn').disabled = false;
}

// Ajouter la fonction pasteFrame
function pasteFrame() {
    if (!copiedFrame) return;
    
    saveCurrentFrame();
    // Insérer la copie après la frame actuelle
    frames.splice(currentFrame + 1, 0, JSON.parse(JSON.stringify(copiedFrame)));
    currentFrame++;
    loadFrame(currentFrame);
    updateFramesList();
}

// Ajouter la fonction pour afficher les crédits
function showCredits() {
    const modal = document.createElement('div');
    modal.className = 'credits-modal';
    
    const content = document.createElement('div');
    content.className = 'credits-content';
    
    content.innerHTML = `
        <h2>Éditeur de Pixels - Crédits</h2>
        <div class="credits-section">
            <h3>Version</h3>
            <p>Version 1.0.0 (Février 2025)</p>
        </div>
        <div class="credits-section">
            <h3>Développement</h3>
            <p>Frédéric Terrasson - Développeur principal</p>
            <p>Contact : monstertaz06@gmail.com</p>
            <p>Claude AI - Assistant de développement</p>
        </div>
        <div class="credits-section">
            <h3>Fonctionnalités</h3>
            <ul>
                <li>Création d'animations pixel par pixel</li>
                <li>Système multi-frames avec prévisualisation</li>
                <li>Outils de dessin avancés (pinceau, gomme)</li>
                <li>Gestion intuitive des frames (copier/coller, glisser-déposer)</li>
                <li>Visualisation des frames précédentes</li>
            </ul>
        </div>
        <div class="credits-section">
            <h3>Date de création</h3>
            <p>2 Février 2025</p>
        </div>
        <div class="credits-section">
            <h3>Copyright et Licence</h3>
            <p>© 2025 Frédéric Terrasson. Tous droits réservés.</p>
            <p>Ce logiciel est protégé par le droit d'auteur et les traités internationaux.</p>
            <p>Licence : Creative Commons Attribution-NonCommercial 4.0 International</p>
            <ul class="license-terms">
                <li>Vous êtes autorisé à utiliser ce logiciel librement à des fins non commerciales</li>
                <li>Toute modification ou redistribution doit mentionner l'auteur original</li>
                <li>L'utilisation commerciale nécessite une autorisation écrite de l'auteur</li>
            </ul>
        </div>
        <button class="close-credits">Fermer</button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
    
    // Fermeture avec le bouton
    modal.querySelector('.close-credits').addEventListener('click', () => {
        modal.remove();
    });
    
    // Fermeture en cliquant en dehors
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// Ajouter la fonction saveProject pour la sauvegarde complète
function saveProject() {
    // Sauvegarder la frame courante avant l'export
    saveCurrentFrame();
    
    const saveDialog = document.createElement('div');
    saveDialog.className = 'save-dialog';
    
    saveDialog.innerHTML = `
        <div class="save-dialog-content">
            <h3>Sauvegarder le projet</h3>
            <input type="text" id="projectName" placeholder="Nom du projet" value="pixel_animation">
            <div class="dialog-buttons">
                <button id="dialogSave">Sauvegarder</button>
                <button id="dialogCancel">Annuler</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(saveDialog);
    
    const projectNameInput = saveDialog.querySelector('#projectName');
    projectNameInput.focus();
    
    saveDialog.querySelector('#dialogSave').addEventListener('click', () => {
        const projectName = projectNameInput.value || 'pixel_animation';
        const projectData = {
            frames: frames,
            currentFrame: currentFrame,
            version: '1.0.0',
            date: new Date().toISOString()
        };
        
        // Créer et télécharger le fichier
        const blob = new Blob([JSON.stringify(projectData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${projectName}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        saveDialog.remove();
    });
    
    saveDialog.querySelector('#dialogCancel').addEventListener('click', () => {
        saveDialog.remove();
    });
}
