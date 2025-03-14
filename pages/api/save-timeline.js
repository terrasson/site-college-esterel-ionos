import fs from 'fs';
import path from 'path';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { data, path: filePath } = req.body;
      
      // Chemin absolu vers le fichier
      const absolutePath = path.join(process.cwd(), filePath);
      
      // Écrire les données dans le fichier JSON
      fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2));
      
      // Répondre avec succès
      res.status(200).json({ success: true, message: 'Configuration sauvegardée avec succès' });
    } catch (error) {
      console.error("Erreur lors de la sauvegarde:", error);
      res.status(500).json({ success: false, message: 'Erreur lors de la sauvegarde', error: error.message });
    }
  } else {
    res.status(405).json({ success: false, message: 'Méthode non autorisée' });
  }
} 