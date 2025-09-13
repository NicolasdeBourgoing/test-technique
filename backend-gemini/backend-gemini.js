const express = require('express');
const cors = require('cors');
const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fonction pour récupérer le contenu de la page
async function fetchPageContent(url) {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000
    });
    
    const $ = cheerio.load(response.data);
    
    // Extraire les éléments importants
    const content = {
      title: $('title').text() || '',
      description: $('meta[name="description"]').attr('content') || '',
      h1: $('h1').map((i, el) => $(el).text()).get(),
      productInfo: $('.product-info, .product-description, .product-details').text() || '',
      price: $('.price, .product-price, [data-price]').text() || '',
      reviews: $('.review, .rating, .stars').text() || '',
      shipping: $('.shipping, .delivery, .livraison').text() || '',
      stock: $('.stock, .availability, .disponibilite').text() || '',
      images: $('img').map((i, el) => $(el).attr('alt')).get().filter(alt => alt),
      bodyText: $('body').text().substring(0, 5000) // Limite à 5000 chars
    };
    
    return content;
  } catch (error) {
    throw new Error(`Erreur lors de la récupération de la page: ${error.message}`);
  }
}

// Prompt pour Gemini
const createAnalysisPrompt = (content, url) => {
  return `Analyse cette page produit e-commerce et donne un score détaillé sur 100 points selon 3 critères.

URL: ${url}
Titre: ${content.title}
Description: ${content.description}
Contenu: ${content.bodyText}

Analyse selon ces 3 critères:

1. **Informations Produit** (0-100):
   - Qualité et complétude de la description
   - Présence d'images/vidéos
   - Spécifications techniques
   - Instructions d'usage

2. **Livraison et Retours** (0-100):
   - Clarté des délais de livraison
   - Options de livraison disponibles
   - Politique de retour visible et claire
   - Frais de port transparents

3. **Confiance** (0-100):
   - Avis clients et notes
   - Indicateurs de stock
   - Badges de sécurité/certifications
   - Informations sur l'entreprise

IMPORTANT: Réponds UNIQUEMENT au format JSON suivant:
{
  "overallScore": 85,
  "scores": {
    "productInformation": 88,
    "shippingAndReturns": 82,
    "trustBuilding": 85
  },
  "analysis": {
    "productInformation": {
      "pros": ["Description détaillée", "Images de qualité"],
      "cons": ["Manque de vidéo", "Pas de guide d'utilisation"]
    },
    "shippingAndReturns": {
      "pros": ["Délais clairs", "Politique visible"],
      "cons": ["Frais non gratuits", "Délai retour court"]
    },
    "trustBuilding": {
      "pros": ["Nombreux avis", "Stock affiché"],
      "cons": ["Avis anciens", "Manque certifications"]
    }
  }
}`;
};

// Route d'analyse
app.post('/analyze', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL manquante' });
    }

    console.log(`Analyse de: ${url}`);
    
    // 1. Récupérer le contenu de la page
    const pageContent = await fetchPageContent(url);
    
    // 2. Analyser avec Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = createAnalysisPrompt(pageContent, url);
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const analysisText = response.text();
    
    // 3. Parser la réponse JSON
    let analysisData;
    try {
      // Nettoyer la réponse (supprimer ```json si présent)
      const cleanedResponse = analysisText.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleanedResponse);
    } catch (parseError) {
      console.error('Erreur parsing JSON:', analysisText);
      throw new Error('Réponse Gemini mal formatée');
    }
    
    // 4. Ajouter l'URL à la réponse
    analysisData.url = url;
    
    console.log('Analyse terminée:', analysisData);
    
    res.json(analysisData);
    
  } catch (error) {
    console.error('Erreur analyse:', error.message);
    res.status(500).json({ 
      error: 'Erreur lors de l\'analyse', 
      details: error.message 
    });
  }
});

// Route de test
app.get('/test', (req, res) => {
  res.json({ message: 'Backend fonctionne!' });
});

app.listen(PORT, () => {
  console.log(`Serveur backend démarré sur le port ${PORT}`);
  console.log(`Test: http://localhost:${PORT}/test`);
});