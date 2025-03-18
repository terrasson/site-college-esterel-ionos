require('dotenv').config();
const express = require('express');
const cookieParser = require('cookie-parser');
const { rateLimit } = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const path = require('path');
const authConfig = require('./src/config/auth.config');
const fs = require('fs').promises;
const multer = require('multer');
const sharp = require('sharp');
const { put, list, del } = require('@vercel/blob');
const NodeCache = require('node-cache');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json({ limit: '50mb' }));
app.use(cookieParser());
app.use(express.static('public'));

// Rate limiting
const loginLimiter = rateLimit({
    limit: 5,
    windowMs: 900000
});

// Add this after your existing middleware
const PUBLIC_PATHS = [
    '/index.html',
    '/',
    '/css/',
    '/js/login.js',
    '/assets/',
    '/api/login',
    '/api/logout',
    '/api/check-auth'
];

// Middleware to check if path should be public
const isPublicPath = (path) => {
    return PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath));
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
    if (isPublicPath(req.path)) {
        return next();
    }

    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Authentication required' });
    }

    try {
        const decoded = jwt.verify(token, authConfig.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.clearCookie('token');
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Login route
app.post('/api/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        // Find user
        const user = authConfig.users.find(u => u.username === username);

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Direct password comparison
        const isValidPassword = password === user.password;

        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                username: user.username,
                role: user.role,
            },
            authConfig.jwt.secret,
            {
                expiresIn: authConfig.jwt.duration / 1000,
                algorithm: 'HS256'
            }
        );

        // Set secure cookie
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: authConfig.jwt.duration,
            path: '/'
        });

        res.json({
            message: 'Login successful',
            user: {
                username: user.username,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Logout route
app.post('/api/logout', (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/'
    });
    res.json({ message: 'Logged out successfully' });
});

// Add a route to check authentication status
app.get('/api/auth/status', authenticateToken, (req, res) => {
    res.json({
        authenticated: true,
        user: {
            username: req.user.username,
            role: req.user.role
        }
    });
});

// Add with other routes
app.get('/api/check-auth', (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    try {
        jwt.verify(token, authConfig.jwt.secret);
        res.json({ message: 'Authenticated' });
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

// Add with other routes
app.post('/api/ticker-message', async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({ message: 'Le message est requis' });
        }

        const filePath = path.join(__dirname, 'public', 'data', 'ticker-message.json');

        await fs.writeFile(filePath, JSON.stringify({ message }));

        res.json({ message: 'Message mis à jour avec succès' });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du message:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour du message' });
    }
});

// Configuration de multer pour l'upload des images
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
        files: 10 // max 10 fichiers à la fois
    },
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Seules les images sont acceptées'), false);
        }
        cb(null, true);
    }
});

// Route pour uploader une photo
app.post('/api/upload-cuisine-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucune image fournie' });
        }

        const filename = `cuisine_${Date.now()}.webp`;

        // Process image with Sharp first
        const processedImageBuffer = await sharp(req.file.buffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        // Upload to Vercel Blob
        const { url } = await put(`cuisine/${filename}`, processedImageBuffer, {
            access: 'public',
            contentType: 'image/webp'
        });

        res.json({
            message: 'Image téléchargée avec succès',
            filename: filename,
            url: url
        });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        res.status(500).json({ message: 'Erreur lors du traitement de l\'image' });
    }
});

// Route pour récupérer la liste des photos
app.get('/api/cuisine-photos', async (req, res) => {
    try {
        // Vérifier le cache d'abord
        const cachedPhotos = cache.get(CACHE_KEYS.CUISINE_PHOTOS);
        if (cachedPhotos) {
            return res.json(cachedPhotos);
        }

        const { blobs } = await list({ prefix: 'cuisine/' });
        const images = blobs.map(blob => ({
            filename: blob.pathname.split('/').pop(),
            url: blob.url
        }));

        // Mettre en cache pour 5 minutes
        cache.set(CACHE_KEYS.CUISINE_PHOTOS, images, CACHE_DURATIONS.PHOTOS);
        res.json(images);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour supprimer une photo de cuisine
app.delete('/api/cuisine-photos/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;

        // Obtenir la liste des blobs existants
        const { blobs } = await list();

        // Trouver le blob exact à supprimer
        const blobToDelete = blobs.find(blob => blob.pathname === `cuisine/${filename}`);

        if (!blobToDelete) {
            return res.status(404).json({ message: 'Photo non trouvée' });
        }

        // Supprimer en utilisant l'URL complète
        await del(blobToDelete.url);

        res.json({ message: 'Photo supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la photo' });
    }
});

app.post('/api/publish-photos-cuisine', async (req, res) => {
    try {
        const { photos } = req.body;
        if (!Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ message: 'Aucune photo sélectionnée' });
        }

        // List all blobs in the cuisine directory
        const { blobs } = await list({ prefix: 'cuisine/' });

        // Filter the blobs that match the selected photos
        const selectedBlobs = blobs.filter(blob =>
            photos.includes(blob.pathname.split('/').pop())
        );

        // Copy each selected photo to the publication directory
        for (const blob of selectedBlobs) {
            const filename = blob.pathname.split('/').pop();
            const response = await fetch(blob.url);
            const buffer = await response.arrayBuffer();

            await put(`publication/${filename}`, buffer, {
                access: 'public',
                contentType: blob.contentType
            });
        }

        res.json({ success: true, message: 'Photos publiées avec succès' });
    } catch (error) {
        console.error('Erreur lors de la publication des photos:', error);
        res.status(500).json({ message: 'Erreur lors de la publication des photos' });
    }
});

// Route pour l'API qui liste les images
app.get('/api/images-list', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion');
        const files = await fs.readdir(directoryPath);

        // Filtrer pour ne garder que les images
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        res.json(imageFiles);
    } catch (error) {
        console.error('Erreur lors de la lecture du dossier:', error);
        res.status(500).json({ error: 'Erreur lors de la lecture du dossier d\'images' });
    }
});

// Route pour uploader une photo de direction
app.post('/api/upload-direction-photo', upload.single('photo'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucune image fournie' });
        }

        const filename = `direction_${Date.now()}.webp`;

        const processedImageBuffer = await sharp(req.file.buffer)
            .resize(1200, 1200, {
                fit: 'inside',
                withoutEnlargement: true
            })
            .webp({ quality: 80 })
            .toBuffer();

        const { url } = await put(`direction/${filename}`, processedImageBuffer, {
            access: 'public',
            contentType: 'image/webp'
        });

        res.json({
            message: 'Image téléchargée avec succès',
            filename: filename,
            url: url
        });
    } catch (error) {
        console.error('Erreur lors du traitement de l\'image:', error);
        res.status(500).json({ message: 'Erreur lors du traitement de l\'image' });
    }
});

// Route pour récupérer la liste des photos de direction
app.get('/api/direction-photos', async (req, res) => {
    try {
        // Vérifier le cache d'abord
        const cachedPhotos = cache.get(CACHE_KEYS.DIRECTION_PHOTOS);
        if (cachedPhotos) {
            return res.json(cachedPhotos);
        }

        const { blobs } = await list({ prefix: 'direction/' });
        const photos = blobs.map(blob => ({
            filename: blob.pathname.split('/').pop(),
            url: blob.url
        }));

        // Mettre en cache pour 5 minutes
        cache.set(CACHE_KEYS.DIRECTION_PHOTOS, photos, CACHE_DURATIONS.PHOTOS);
        res.json(photos);
    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
});

// Route pour supprimer une photo de direction
app.delete('/api/direction-photos/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { blobs } = await list({ prefix: 'direction/' });
        const blobToDelete = blobs.find(blob => blob.pathname === `direction/${filename}`);

        if (!blobToDelete) {
            return res.status(404).json({ message: 'Photo non trouvée' });
        }

        await del(blobToDelete.url);
        invalidateCache(CACHE_KEYS.DIRECTION_PHOTOS);

        res.json({ message: 'Photo supprimée avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression de la photo:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de la photo' });
    }
});

// Configuration pour l'upload des documents (cuisine et direction)
const documentUpload = multer({
    storage: multer.memoryStorage(),
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx|ppt|pptx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seuls les fichiers PDF, Word et PowerPoint sont autorisés!'));
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite à 10MB
    }
});

// Route pour l'upload des documents de cuisine
app.post('/api/upload-menu-cuisine', documentUpload.single('menu'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun document fourni' });
        }

        const filename = `menu_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;

        // Upload to Vercel Blob
        const { url } = await put(`cuisine-docs/${filename}`, req.file.buffer, {
            access: 'public',
            contentType: req.file.mimetype
        });

        res.json({
            message: 'Document téléchargé avec succès',
            filename: filename,
            originalName: req.file.originalname,
            url: url
        });
    } catch (error) {
        console.error('Erreur lors du traitement du document:', error);
        res.status(500).json({ message: 'Erreur lors du traitement du document' });
    }
});

// Route pour récupérer la liste des menus de cuisine
app.get('/api/menu-cuisine', async (req, res) => {
    try {
        const { blobs } = await list({ prefix: 'cuisine-docs/' });

        const documents = blobs.map(blob => ({
            filename: blob.pathname.split('/').pop(),
            originalName: blob.pathname.split('/').pop().replace(/^menu_\d+_/, ''),
            url: blob.url,
            type: 'document'
        }));

        res.json(documents);
    } catch (error) {
        console.error('Erreur lors de la lecture des menus:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des menus' });
    }
});

// Route pour supprimer un menu de cuisine
app.delete('/api/menu-cuisine/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { blobs } = await list();
        const blobToDelete = blobs.find(blob => blob.pathname === `cuisine-docs/${filename}`);

        if (!blobToDelete) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        await del(blobToDelete.url);
        res.json({ message: 'Document supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du document' });
    }
});

// Route pour l'upload des documents de direction
app.post('/api/upload-direction-document', documentUpload.single('document'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun document fourni' });
        }

        const filename = `doc_${Date.now()}_${req.file.originalname.replace(/\s+/g, '_')}`;

        // Upload to Vercel Blob
        const { url } = await put(`direction-docs/${filename}`, req.file.buffer, {
            access: 'public',
            contentType: req.file.mimetype
        });

        res.json({
            message: 'Document téléchargé avec succès',
            filename: filename,
            originalName: req.file.originalname,
            url: url
        });
    } catch (error) {
        console.error('Erreur lors du traitement du document:', error);
        res.status(500).json({ message: 'Erreur lors du traitement du document' });
    }
});

// Route pour récupérer la liste des documents de direction
app.get('/api/direction-documents', async (req, res) => {
    try {
        const { blobs } = await list({ prefix: 'direction-docs/' });

        const documents = blobs.map(blob => ({
            filename: blob.pathname.split('/').pop(),
            originalName: blob.pathname.split('/').pop().replace(/^doc_\d+_/, ''),
            url: blob.url,
            type: 'document'
        }));

        res.json(documents);
    } catch (error) {
        console.error('Erreur lors de la lecture des documents:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
});

// Route pour supprimer un document de direction
app.delete('/api/direction-documents/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const { blobs } = await list();
        const blobToDelete = blobs.find(blob => blob.pathname === `direction-docs/${filename}`);

        if (!blobToDelete) {
            return res.status(404).json({ message: 'Document non trouvé' });
        }

        await del(blobToDelete.url);
        res.json({ message: 'Document supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du document:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du document' });
    }
});

// Configuration pour les menus cuisine
const menuStorage = multer.diskStorage({
    destination: async function (req, file, cb) {
        const dir = path.join(__dirname, 'public', 'assets', 'data', 'menu-cuisine');
        try {
            await fs.mkdir(dir, { recursive: true });
            cb(null, dir);
        } catch (error) {
            cb(error, null);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'menu_' + uniqueSuffix + '_' + file.originalname.replace(/\s+/g, '_'));
    }
});

const menuUpload = multer({
    storage: menuStorage,
    fileFilter: (req, file, cb) => {
        const filetypes = /pdf|doc|docx/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Seuls les fichiers PDF et Word sont autorisés!'));
    },
    limits: {
        fileSize: 10 * 1024 * 1024 // Limite à 10MB
    }
});

// Route pour l'upload de menus
app.post('/api/upload-menu-cuisine', menuUpload.single('menu'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Aucun menu fourni' });
        }

        console.log('Menu reçu:', req.file);

        res.json({
            message: 'Menu téléchargé avec succès',
            filename: req.file.filename,
            originalName: req.file.originalname
        });
    } catch (error) {
        console.error('Erreur lors du traitement du menu:', error);
        res.status(500).json({ message: 'Erreur lors du traitement du menu' });
    }
});

// Route pour récupérer la liste des menus
app.get('/api/menu-cuisine', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'public', 'assets', 'data', 'menu-cuisine');
        await fs.mkdir(directoryPath, { recursive: true });

        const files = await fs.readdir(directoryPath);
        const documents = files.map(filename => ({
            filename,
            originalName: filename.replace(/^menu_\d+-\d+_/, '')
        }));

        res.json(documents);
    } catch (error) {
        console.error('Erreur lors de la lecture des menus:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des menus' });
    }
});

// Route pour supprimer un menu
app.delete('/api/menu-cuisine/:filename', async (req, res) => {
    try {
        const filename = req.params.filename;
        const filepath = path.join(__dirname, 'public', 'assets', 'data', 'menu-cuisine', filename);
        const normalizedPath = path.normalize(filepath);
        const menusDir = path.join(__dirname, 'public', 'assets', 'data', 'menu-cuisine');

        if (!normalizedPath.startsWith(menusDir)) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }

        await fs.unlink(filepath);
        res.json({ message: 'Menu supprimé avec succès' });
    } catch (error) {
        console.error('Erreur lors de la suppression du menu:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression du menu' });
    }
});

// Routes pour la gestion des diaporamas
app.get('/api/cuisine-images-list', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'public', 'assets', 'img', 'cuisine');
        await fs.mkdir(directoryPath, { recursive: true });

        const files = await fs.readdir(directoryPath);
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });

        res.json(images);
    } catch (error) {
        console.error('Erreur lors de la lecture des images cuisine:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des images' });
    }
});

app.get('/api/direction-images-list', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'public', 'assets', 'img', 'direction');
        await fs.mkdir(directoryPath, { recursive: true });

        const files = await fs.readdir(directoryPath);
        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif'].includes(ext);
        });

        res.json(images);
    } catch (error) {
        console.error('Erreur lors de la lecture des images direction:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des images' });
    }
});

app.get('/api/direction-documents', async (req, res) => {
    try {
        const directoryPath = path.join(__dirname, 'public', 'assets', 'data', 'document-direction');
        await fs.mkdir(directoryPath, { recursive: true });

        const files = await fs.readdir(directoryPath);
        const documents = files.map(filename => ({
            filename,
            originalName: filename.replace(/^doc_\d+-\d+_/, '')
        }));

        res.json(documents);
    } catch (error) {
        console.error('Erreur lors de la lecture des documents direction:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des documents' });
    }
});

// Initialize cache with production settings
const cache = new NodeCache({
    stdTTL: 3600, // 1 hour default
    checkperiod: 120, // Check for expired entries every 2 minutes
    useClones: false, // Better performance for JSON data
    deleteOnExpire: true
});

// Cache keys
const CACHE_KEYS = {
    DIRECTION_PHOTOS: 'direction_photos',
    CUISINE_PHOTOS: 'cuisine_photos',
    DIRECTION_DOCS: 'direction_docs',
    CUISINE_DOCS: 'cuisine_docs',
    DIAPORAMA_CONFIG: 'diaporama_config'
};

const CACHE_DURATIONS = {
    PHOTOS: 300,  // 5 minutes
    DOCS: 300,    // 5 minutes
    CONFIG: 60    // 1 minute
};

// Route pour sauvegarder la configuration
app.post('/api/diaporama-config', async (req, res) => {
    try {
        const config = {
            cuisine: {
                medias: Array.isArray(req.body?.cuisine?.medias) ? req.body.cuisine.medias : [],
                schedules: Array.isArray(req.body?.cuisine?.schedules) ? req.body.cuisine.schedules : []
            },
            direction: {
                medias: Array.isArray(req.body?.direction?.medias) ? req.body.direction.medias : [],
                schedules: Array.isArray(req.body?.direction?.schedules) ? req.body.direction.schedules : []
            }
        };

        // Save to blob storage
        const { url } = await put('config/diaporama-config.json',
            JSON.stringify(config, null, 2), {
            access: 'public',
            contentType: 'application/json'
        });

        // Update cache
        cache.set(CACHE_KEYS.DIAPORAMA_CONFIG, config);
        console.log('Updated diaporama config cache');

        res.json({
            success: true,
            message: 'Configuration saved successfully',
            config: config,
            url: url
        });
    } catch (error) {
        console.error('Error saving diaporama config:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Route pour récupérer la configuration des diaporamas
app.get('/api/diaporama-config', async (req, res) => {
    try {
        // Try to get from cache first
        const cachedConfig = cache.get(CACHE_KEYS.DIAPORAMA_CONFIG);
        if (cachedConfig) {
            console.log('Serving diaporama config from cache');
            return res.json(cachedConfig);
        }

        // If not in cache, get from blob storage
        const { blobs } = await list({ prefix: 'config/' });
        const configBlobs = blobs
            .filter(b => b.pathname === 'config/diaporama-config.json')
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        const configBlob = configBlobs[0];

        if (configBlob) {
            const response = await fetch(configBlob.url);
            if (!response.ok) {
                throw new Error(`Failed to fetch config: ${response.status}`);
            }
            const config = await response.json();

            // Cache the result
            cache.set(CACHE_KEYS.DIAPORAMA_CONFIG, config);
            console.log('Cached new diaporama config');

            return res.json(config);
        }

        // Default config if none exists
        const emptyConfig = {
            cuisine: { medias: [], schedules: [] },
            direction: { medias: [], schedules: [] }
        };

        // Save and cache empty config
        const { url } = await put('config/diaporama-config.json',
            JSON.stringify(emptyConfig, null, 2), {
            access: 'public',
            contentType: 'application/json'
        });

        cache.set(CACHE_KEYS.DIAPORAMA_CONFIG, emptyConfig);
        res.json(emptyConfig);

    } catch (error) {
        console.error('Error loading diaporama config:', error);
        res.status(500).json({
            error: 'Error loading configuration',
            details: error.message
        });
    }
});

// Fonction pour mettre à jour les fichiers dans le dossier de diffusion
async function updateDiffusionFiles(config, section) {
    const imageSourcePath = path.join(__dirname, 'public', 'assets', 'img', section);
    const docSourcePath = path.join(__dirname, 'public', 'assets', 'data',
        section === 'cuisine' ? 'menu-cuisine' : 'document-direction');

    const diffusionPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section);

    try {
        // Nettoyer le dossier de diffusion
        await fs.rm(diffusionPath, { recursive: true, force: true });
        await fs.mkdir(diffusionPath, { recursive: true });

        // Copier les fichiers activés dans l'ordre
        for (const media of config.medias) {
            if (media.enabled !== false) {
                const isImage = media.path.includes('/img/');
                const sourceFile = path.join(__dirname, 'public', media.path);
                const destFile = path.join(diffusionPath, path.basename(media.path));

                try {
                    await fs.copyFile(sourceFile, destFile);
                    console.log(`Fichier copié avec succès: ${path.basename(media.path)}`);
                } catch (err) {
                    console.error(`Erreur lors de la copie du fichier ${path.basename(media.path)}:`, err);
                }
            }
        }
    } catch (error) {
        console.error(`Erreur lors de la mise à jour des fichiers de diffusion ${section}:`, error);
    }
}

if (process.env.NODE_ENV !== 'production') {
    app.get('/api/rate-limit-status', (req, res) => {
        const rateLimitInfo = {
            ip: req.ip,
            remaining: req.rateLimit?.remaining,
            limit: req.rateLimit?.limit,
            resetTime: req.rateLimit?.resetTime,
            current: req.rateLimit?.current
        };
        res.json(rateLimitInfo);
    });
}

app.post('/api/transfer-media', async (req, res) => {
    try {
        const { section, files } = req.body;
        const diffusionPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section);

        // Debug logs
        console.log('Section:', section);
        console.log('Files:', files);

        // Créer le dossier de diffusion s'il n'existe pas
        await fs.mkdir(diffusionPath, { recursive: true });

        // Copier chaque fichier sélectionné
        for (const filename of files) {
            // Déterminer si c'est une image ou un document basé sur l'extension
            const isImage = ['.jpg', '.jpeg', '.png', '.gif'].some(ext =>
                filename.toLowerCase().endsWith(ext)
            );

            const sourcePath = path.join(__dirname, 'public', 'assets',
                isImage ? `img/${section}` : `data/${section === 'cuisine' ? 'menu-cuisine' : 'document-direction'}`,
                filename
            );
            const destPath = path.join(diffusionPath, filename);

            console.log('Copying from:', sourcePath);
            console.log('Copying to:', destPath);

            await fs.copyFile(sourcePath, destPath);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur détaillée lors du transfert:', error);
        res.status(500).json({ error: 'Erreur lors du transfert des fichiers' });
    }
});

// Route pour récupérer les fichiers du dossier de diffusion
app.get('/api/:section-diffusion-files', async (req, res) => {
    try {
        const { section } = req.params;
        const diffusionPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section);

        // Créer le dossier s'il n'existe pas
        await fs.mkdir(diffusionPath, { recursive: true });

        const files = await fs.readdir(diffusionPath);
        res.json(files);
    } catch (error) {
        console.error('Erreur lors de la lecture du dossier de diffusion:', error);
        res.status(500).json({ error: 'Erreur lors de la lecture des fichiers' });
    }
});

// Route pour supprimer un fichier du dossier de diffusion
app.delete('/api/:section-diffusion-files/:filename', async (req, res) => {
    try {
        const { section, filename } = req.params;
        const filepath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section, filename);

        await fs.unlink(filepath);
        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression du fichier:', error);
        res.status(500).json({ error: 'Erreur lors de la suppression du fichier' });
    }
});

app.get('/api/:section-images-list', async (req, res) => {
    try {
        const { section } = req.params;
        // Enlever 'images-list' de la section
        const cleanSection = section.replace('-images-list', '');
        console.log('Section nettoyée:', cleanSection);

        const directoryPath = path.join(__dirname, 'public', 'assets', 'img', cleanSection);
        console.log('Chemin du dossier:', directoryPath);

        const files = await fs.readdir(directoryPath);
        console.log('Fichiers trouvés:', files);

        const images = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
        });

        console.log('Images à envoyer:', images);
        res.json(images);

    } catch (error) {
        console.error('Erreur:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ajouter une route de test pour vérifier l'accès aux fichiers statiques
app.get('/api/test-image/:section/:filename', async (req, res) => {
    try {
        const { section, filename } = req.params;
        const imagePath = path.join(__dirname, 'public', 'assets', 'img', section, filename);

        console.log('Test accès image:', imagePath);

        // Vérifier si le fichier existe
        const exists = await fs.access(imagePath).then(() => true).catch(() => false);
        console.log('Image existe:', exists);

        if (!exists) {
            return res.status(404).json({ error: 'Image non trouvée' });
        }

        // Lire les métadonnées du fichier
        const stats = await fs.stat(imagePath);

        res.json({
            exists: true,
            path: imagePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
        });

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ajouter cette nouvelle route pour déboguer
app.get('/api/debug/list-directories', async (req, res) => {
    try {
        const baseImgPath = path.join(__dirname, 'public', 'assets', 'img');
        console.log('Chemin de base:', baseImgPath);

        // Vérifier si le dossier de base existe
        const baseExists = await fs.access(baseImgPath).then(() => true).catch(() => false);
        console.log('Dossier assets/img existe:', baseExists);

        if (!baseExists) {
            return res.json({
                error: 'Le dossier assets/img n\'existe pas',
                path: baseImgPath
            });
        }

        // Lister le contenu du dossier img
        const imgContent = await fs.readdir(baseImgPath, { withFileTypes: true });

        // Organiser le contenu
        const structure = {
            directories: [],
            files: []
        };

        for (const item of imgContent) {
            if (item.isDirectory()) {
                const subPath = path.join(baseImgPath, item.name);
                const subContent = await fs.readdir(subPath);
                structure.directories.push({
                    name: item.name,
                    content: subContent
                });
            } else {
                structure.files.push(item.name);
            }
        }

        res.json(structure);
    } catch (error) {
        console.error('Erreur lors de la lecture des dossiers:', error);
        res.status(500).json({
            error: error.message,
            stack: error.stack
        });
    }
});

// Routes pour la gestion du diaporama
const timelineDataPath = path.join(__dirname, 'data', 'timelines');

// Assurer que le dossier des timelines existe
fs.mkdir(timelineDataPath, { recursive: true }).catch(console.error);

// Route pour lister les médias (photos et documents)
app.get('/api/list-media/:section/:type', async (req, res) => {
    try {
        const { section, type } = req.params;

        if (type === 'photos') {
            const { blobs } = await list({ prefix: `${section}/` });
            const photos = blobs.map(blob => ({
                name: blob.pathname.split('/').pop(),
                url: blob.url,
                type: 'image'
            }));
            res.json(photos);
        } else if (type === 'documents') {
            const { blobs } = await list({ prefix: `${section}-docs/` });
            const documents = blobs.map(blob => ({
                name: blob.pathname.split('/').pop(),
                url: blob.url,
                type: 'document',
                originalName: blob.pathname.split('/').pop()
            }));
            res.json(documents);
        }
    } catch (error) {
        console.error('Erreur lors de la lecture des médias:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer la timeline d'une section
app.get('/api/timeline/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const timelinePath = path.join(timelineDataPath, `${section}.json`);

        let timeline = [];
        try {
            const data = await fs.readFile(timelinePath, 'utf8');
            timeline = JSON.parse(data);
        } catch (error) {
            // Si le fichier n'existe pas, retourner un tableau vide
            console.log(`Pas de timeline existante pour ${section}`);
        }

        res.json(timeline);
    } catch (error) {
        console.error('Erreur lors de la lecture de la timeline:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour sauvegarder la timeline
app.post('/api/timeline/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const timelinePath = path.join(timelineDataPath, `${section}.json`);
        const timelineData = req.body;

        // Sauvegarder la timeline
        await fs.writeFile(timelinePath, JSON.stringify(timelineData, null, 2));

        // Copier les fichiers vers le dossier de diffusion
        const diffusionPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section);
        await fs.mkdir(diffusionPath, { recursive: true });

        // Nettoyer le dossier de diffusion
        const existingFiles = await fs.readdir(diffusionPath);
        await Promise.all(existingFiles.map(file =>
            fs.unlink(path.join(diffusionPath, file)).catch(console.error)
        ));

        // Copier les nouveaux fichiers
        await Promise.all(timelineData.map(async item => {
            const sourcePath = path.join(__dirname, 'public', item.path);
            const destPath = path.join(diffusionPath, path.basename(item.path));
            return fs.copyFile(sourcePath, destPath).catch(console.error);
        }));

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde de la timeline:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour supprimer un élément de la timeline
app.delete('/api/timeline/:section/item', async (req, res) => {
    try {
        const { section } = req.params;
        const { name } = req.body;
        const diffusionPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section);
        const filePath = path.join(diffusionPath, name);

        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.log(`Fichier non trouvé dans le dossier de diffusion: ${name}`);
        }

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour récupérer les transitions disponibles
app.get('/api/transitions', (req, res) => {
    const transitions = [
        { id: 'fade', name: 'Fondu', duration: 1000 },
        { id: 'slide', name: 'Glissement', duration: 800 },
        { id: 'zoom', name: 'Zoom', duration: 1200 },
        { id: 'flip', name: 'Retournement', duration: 1500 }
    ];
    res.json(transitions);
});

// Route pour vérifier l'état du diaporama
app.get('/api/diaporama-status/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const timelinePath = path.join(timelineDataPath, `${section}.json`);
        const diffusionPath = path.join(__dirname, 'public', 'assets', 'img', 'dossier-de-diffusion', section);

        const status = {
            hasTimeline: await fs.access(timelinePath).then(() => true).catch(() => false),
            itemCount: 0,
            lastModified: null
        };

        if (status.hasTimeline) {
            const timelineData = JSON.parse(await fs.readFile(timelinePath, 'utf8'));
            status.itemCount = timelineData.length;
            status.lastModified = (await fs.stat(timelinePath)).mtime;
        }

        res.json(status);
    } catch (error) {
        console.error('Erreur lors de la vérification du statut:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour obtenir le contenu d'un dossier
app.get('/api/folder-content/:section/:type/*?', async (req, res) => {
    try {
        const { section, type } = req.params;
        const subPath = req.params[0] || ''; // Chemin supplémentaire s'il existe

        // Déterminer le chemin de base selon le type
        let basePath;
        if (type === 'photos') {
            basePath = path.join(__dirname, 'public', 'assets', 'img', section);
        } else {
            basePath = path.join(__dirname, 'public', 'assets', 'data',
                section === 'cuisine' ? 'menu-cuisine' : 'document-direction');
        }

        // Construire le chemin complet
        const fullPath = path.join(basePath, subPath);
        console.log('Lecture du dossier:', fullPath);

        // Vérifier si le chemin existe
        try {
            await fs.access(fullPath);
        } catch {
            return res.status(404).json({ error: 'Dossier non trouvé' });
        }

        // Lire le contenu du dossier
        const items = await fs.readdir(fullPath, { withFileTypes: true });

        // Séparer les dossiers et les fichiers
        const folders = [];
        const files = [];

        for (const item of items) {
            if (item.isDirectory()) {
                folders.push(item.name);
            } else {
                const ext = path.extname(item.name).toLowerCase();
                const isValidFile = type === 'photos'
                    ? ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext)
                    : ['.pdf', '.doc', '.docx', '.ppt', '.pptx'].includes(ext);

                if (isValidFile) {
                    const itemPath = path.join(subPath, item.name);
                    const publicPath = type === 'photos'
                        ? `/assets/img/${section}/${itemPath}`
                        : `/assets/data/${section === 'cuisine' ? 'menu-cuisine' : 'document-direction'}/${itemPath}`;

                    files.push({
                        name: item.name,
                        path: publicPath.replace(/\\/g, '/'),
                        type: type === 'photos' ? 'image' : 'document'
                    });
                }
            }
        }

        // Trier les dossiers et fichiers par nom
        folders.sort();
        files.sort((a, b) => a.name.localeCompare(b.name));

        res.json({
            currentPath: subPath,
            folders,
            files
        });

    } catch (error) {
        console.error('Erreur lors de la lecture du dossier:', error);
        res.status(500).json({
            error: 'Erreur lors de la lecture du dossier',
            details: error.message
        });
    }
});

// Route pour créer un nouveau dossier
app.post('/api/create-folder/:section/:type/*', async (req, res) => {
    try {
        const { section, type } = req.params;
        const subPath = req.params[0] || '';
        const { folderName } = req.body;

        if (!folderName) {
            return res.status(400).json({ error: 'Nom de dossier requis' });
        }

        // Déterminer le chemin de base
        let basePath;
        if (type === 'photos') {
            basePath = path.join(__dirname, 'public', 'assets', 'img', section);
        } else {
            basePath = path.join(__dirname, 'public', 'assets', 'data',
                section === 'cuisine' ? 'menu-cuisine' : 'document-direction');
        }

        // Créer le nouveau dossier
        const newFolderPath = path.join(basePath, subPath, folderName);
        await fs.mkdir(newFolderPath, { recursive: true });

        res.json({ success: true, path: newFolderPath });

    } catch (error) {
        console.error('Erreur lors de la création du dossier:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour supprimer un dossier
app.delete('/api/delete-folder/:section/:type/*', async (req, res) => {
    try {
        const { section, type } = req.params;
        const subPath = req.params[0] || '';

        // Déterminer le chemin de base
        let basePath;
        if (type === 'photos') {
            basePath = path.join(__dirname, 'public', 'assets', 'img', section);
        } else {
            basePath = path.join(__dirname, 'public', 'assets', 'data',
                section === 'cuisine' ? 'menu-cuisine' : 'document-direction');
        }

        const folderPath = path.join(basePath, subPath);

        // Vérifier si le dossier existe
        try {
            await fs.access(folderPath);
        } catch {
            return res.status(404).json({ error: 'Dossier non trouvé' });
        }

        // Supprimer le dossier et son contenu
        await fs.rm(folderPath, { recursive: true });

        res.json({ success: true });

    } catch (error) {
        console.error('Erreur lors de la suppression du dossier:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour déplacer un fichier
app.post('/api/move-file/:section/:type', async (req, res) => {
    try {
        const { section, type } = req.params;
        const { sourcePath, destinationPath } = req.body;

        // Déterminer le chemin de base
        let basePath;
        if (type === 'photos') {
            basePath = path.join(__dirname, 'public', 'assets', 'img', section);
        } else {
            basePath = path.join(__dirname, 'public', 'assets', 'data',
                section === 'cuisine' ? 'menu-cuisine' : 'document-direction');
        }

        const sourceFullPath = path.join(basePath, sourcePath);
        const destFullPath = path.join(basePath, destinationPath);

        // Déplacer le fichier
        await fs.rename(sourceFullPath, destFullPath);

        res.json({ success: true });

    } catch (error) {
        console.error('Erreur lors du déplacement du fichier:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour sauvegarder la timeline
app.post('/api/save-timeline', async (req, res) => {
    try {
        const { cuisine, direction } = req.body;
        const configPath = path.join(__dirname, 'data', 'diaporama-config.json');

        // Sauvegarder la configuration
        await fs.writeFile(configPath, JSON.stringify({ cuisine, direction }, null, 2));

        res.json({ success: true });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde des diaporamas:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour charger la timeline
app.get('/api/load-timeline/:section', async (req, res) => {
    try {
        const { section } = req.params;
        const timelinePath = path.join(__dirname, 'data', 'timelines', `${section}.json`);

        try {
            const data = await fs.readFile(timelinePath, 'utf8');
            res.json(JSON.parse(data));
        } catch (error) {
            // Si le fichier n'existe pas, renvoyer une timeline vide
            res.json({ items: [] });
        }
    } catch (error) {
        console.error('Erreur lors du chargement de la timeline:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour le contenu du bandeau défilant
app.get('/api/ticker-content', async (req, res) => {
    try {
        const tickerPath = path.join(__dirname, 'data', 'ticker.json');
        let content = "Bienvenue au collège";

        try {
            const data = await fs.readFile(tickerPath, 'utf8');
            const tickerData = JSON.parse(data);
            content = tickerData.content;
        } catch (error) {
            // Utiliser le message par défaut si le fichier n'existe pas
            console.log('Fichier ticker.json non trouvé, utilisation du message par défaut');
        }

        res.json({ content });
    } catch (error) {
        console.error('Erreur lors de la lecture du bandeau défilant:', error);
        res.status(500).json({ error: error.message });
    }
});

// Ajouter ces middlewares pour gérer les différents types de fichiers
app.use('/assets/media', express.static(path.join(__dirname, 'public/assets/media')));

// Route pour lister les fichiers disponibles
app.get('/api/list-files/:section/:type', async (req, res) => {
    try {
        const { section, type } = req.params;
        const dirPath = path.join(__dirname, 'public/assets/media', section, type);
        const files = await fs.readdir(dirPath);
        res.json(files);
    } catch (error) {
        console.error('Erreur lors de la lecture des fichiers:', error);
        res.status(500).json({ error: error.message });
    }
});

// Route pour sauvegarder le message du bandeau défilant
app.post('/api/save-ticker', async (req, res) => {
    try {
        const data = {
            message: req.body.message,
            speed: req.body.speed || 60 // Valeur par défaut si non spécifiée
        };

        // Delete old ticker message if it exists
        try {
            const { blobs } = await list({ prefix: 'config/' });
            for (const blob of blobs) {
                if (blob.pathname === 'config/ticker-message.json') {
                    await del(blob.url);
                }
            }
        } catch (deleteError) {
            console.error('Error deleting old ticker message:', deleteError);
        }

        // Save new ticker message to Vercel Blob Storage
        const { url } = await put('config/ticker-message.json',
            JSON.stringify(data, null, 2), {
            access: 'public',
            contentType: 'application/json'
        });

        res.json({ success: true, url });
    } catch (error) {
        console.error('Erreur lors de la sauvegarde du message:', error);
        res.status(500).json({ error: 'Erreur lors de la sauvegarde' });
    }
});

// Route pour lire le message du bandeau défilant
app.get('/api/ticker-message', async (req, res) => {
    try {
        // Récupérer le message depuis Vercel Blob Storage
        const { blobs } = await list({ prefix: 'config/' });
        const tickerBlobs = blobs
            .filter(b => b.pathname === 'config/ticker-message.json')
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        const tickerBlob = tickerBlobs[0];

        if (tickerBlob) {
            const response = await fetch(tickerBlob.url);
            if (response.ok) {
                const data = await response.json();
                return res.json(data);
            }
        }

        // Message par défaut si aucun message n'est trouvé
        res.json({
            message: 'Bienvenue au Collège de l\'Estérel',
            speed: 30
        });
    } catch (error) {
        console.error('Erreur lors de la lecture du message:', error);
        res.status(500).json({ error: 'Erreur lors de la lecture du message' });
    }
});

// Route pour mettre à jour la vitesse du bandeau défilant
app.post('/api/update-speed', async (req, res) => {
    try {
        const speed = req.body.speed;

        // Get current ticker message
        const { blobs } = await list({ prefix: 'config/' });
        const tickerBlobs = blobs
            .filter(b => b.pathname === 'config/ticker-message.json')
            .sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

        const tickerBlob = tickerBlobs[0];
        let currentData = { message: 'Bienvenue au Collège de l\'Estérel', speed: 60 };

        if (tickerBlob) {
            const response = await fetch(tickerBlob.url);
            if (response.ok) {
                currentData = await response.json();
            }
        }

        // Update speed
        currentData.speed = speed;

        // Save updated data
        const { url } = await put('config/ticker-message.json',
            JSON.stringify(currentData, null, 2), {
            access: 'public',
            contentType: 'application/json'
        });

        res.json({ success: true, url });
    } catch (error) {
        console.error('Error updating ticker speed:', error);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de la vitesse' });
    }
});

app.post('/api/publish-photos', async (req, res) => {
    try {
        const { photos } = req.body;
        if (!Array.isArray(photos) || photos.length === 0) {
            return res.status(400).json({ message: 'Aucune photo sélectionnée' });
        }

        // List all blobs in the direction directory
        const { blobs } = await list({ prefix: 'direction/' });

        // Filter the blobs that match the selected photos
        const selectedBlobs = blobs.filter(blob =>
            photos.includes(blob.pathname.split('/').pop())
        );

        // Copy each selected photo to the publication directory
        for (const blob of selectedBlobs) {
            const filename = blob.pathname.split('/').pop();
            const response = await fetch(blob.url);
            const buffer = await response.arrayBuffer();

            await put(`publication/${filename}`, buffer, {
                access: 'public',
                contentType: blob.contentType
            });
        }

        res.json({ success: true, message: 'Photos publiées avec succès' });
    } catch (error) {
        console.error('Erreur lors de la publication des photos:', error);
        res.status(500).json({ message: 'Erreur lors de la publication des photos' });
    }
});

app.get('/api/list-media/:section/photos', async (req, res) => {
    try {
        const { section } = req.params;
        const { blobs } = await list({ prefix: `${section}/` });

        const photos = blobs.map(blob => ({
            name: blob.pathname.split('/').pop(),
            url: blob.url,
            type: 'image'
        }));

        res.json(photos);
    } catch (error) {
        console.error('Erreur lors de la lecture des médias:', error);
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/rotate-photo', async (req, res) => {
    try {
        const { filename, type, degrees } = req.body;
        const { blobs } = await list();

        // Trouver le blob correspondant
        const blobToRotate = blobs.find(blob => blob.pathname === `${type}/${filename}`);

        if (!blobToRotate) {
            console.log('Photo non trouvée:', type, filename);
            return res.status(404).json({ error: 'Photo non trouvée' });
        }

        console.log('Rotation de la photo:', blobToRotate.url);

        // Télécharger l'image
        const response = await fetch(blobToRotate.url);
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Faire pivoter l'image
        const rotatedBuffer = await sharp(buffer)
            .rotate(degrees)
            .toBuffer();

        console.log('Image pivotée, suppression de l\'ancienne version');

        // Supprimer l'ancien blob
        await del(blobToRotate.url);

        console.log('Upload de la nouvelle version');

        // Uploader la nouvelle version
        const newUrl = await put(`${type}/${filename}`, rotatedBuffer, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN
        });

        console.log('Rotation terminée avec succès');
        res.json({ success: true, url: newUrl });
    } catch (error) {
        console.error('Erreur lors de la rotation:', error);
        res.status(500).json({ error: 'Erreur lors de la rotation de la photo' });
    }
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});

// Assurez-vous que le dossier data existe
async function ensureDataFolder() {
    const dataPath = path.join(__dirname, 'data');
    try {
        await fs.access(dataPath);
    } catch {
        await fs.mkdir(dataPath);
    }
}

// Example for diaporama config
async function getDiaporamaConfig() {
    const cached = cache.get(CACHE_KEYS.DIAPORAMA_CONFIG);
    if (cached) {
        return cached;
    }

    // Your existing blob fetch logic
    const config = await fetch('your-blob-url-for-diaporama-config');
    const data = await config.json();

    // Cache for 1 hour
    cache.set(CACHE_KEYS.DIAPORAMA_CONFIG, data, 3600);
    return data;
}

// When updating config, invalidate cache
async function updateDiaporamaConfig(newConfig) {
    await put('config/diaporama-config.json', JSON.stringify(newConfig));
    cache.del(CACHE_KEYS.DIAPORAMA_CONFIG);
}