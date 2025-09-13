import React, { useState } from 'react';
import { Search, CheckCircle, AlertCircle, TrendingUp, Package, Shield } from 'lucide-react';

//const genAI = new GoogleGenerativeAI("AIzaSyDATxcrJi6iTaPSHT_XGHTxjkCKfDKdQI0");


const ProductPageScorer = () => {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);

  // Mock data pour la démonstration
  const mockResults = {
    url: 'https://www.ohmycream.com/en/products/combeau-hydratant-complement-alimentaire-electrolytes-citron-concombre',
    overallScore: 82,
    scores: {
      productInformation: 85,
      shippingAndReturns: 78,
      trustBuilding: 83
    },
    analysis: {
      productInformation: {
        pros: [
          "Description détaillée du produit avec ingrédients",
          "Images de haute qualité sous plusieurs angles",
          "Informations nutritionnelles complètes"
        ],
        cons: [
          "Manque de vidéo de démonstration",
          "Pas de guide d'utilisation détaillé"
        ]
      },
      shippingAndReturns: {
        pros: [
          "Délais de livraison clairement indiqués",
          "Options de livraison multiples",
          "Politique de retour visible"
        ],
        cons: [
          "Frais de port non gratuits sous 50€",
          "Délai de retour limité à 14 jours"
        ]
      },
      trustBuilding: {
        pros: [
          "Nombreux avis clients (4.5/5)",
          "Stock disponible affiché",
          "Badges de sécurité visibles"
        ],
        cons: [
          "Pas d'avis récents",
          "Manque de certifications produit"
        ]
      }
    }
  };

  const handleSubmit = async () => {
    if (!url.trim()) return;
    setLoading(true);

    try {
      const envApiUrl = import.meta.env.VITE_API_URL;
      const API_URL = envApiUrl && envApiUrl !== '/api' ? envApiUrl : '/api'; 
      console.log(import.meta.env.VITE_API_URL)
      const response = await fetch(`${API_URL}/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url }), // On envoie l'URL dans le corps de la requête
      });

      if (!response.ok) {
        throw new Error('Erreur de réseau ou du serveur');
      }

      const data = await response.json();
      setResults(data); // Met à jour l'état avec les vrais résultats de l'API
      

    } catch (error) {
      console.error("Erreur lors de la requête API:", error);
      // Gérer l'erreur, par exemple en affichant un message à l'utilisateur
      setResults(null); 
      alert("Une erreur est survenue. Veuillez réessayer.");
    } finally {
      setLoading(false); // S'assurer que le chargement se termine quoi qu'il arrive
    }
  };

  const ScoreCard = ({ title, score, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-md border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Icon className={`w-6 h-6 ${color}`} />
          <h3 className="font-semibold text-gray-800">{title}</h3>
        </div>
        <div className={`text-2xl font-bold ${color}`}>
          {score}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full ${color.replace('text-', 'bg-')}`}
          style={{ width: `${score}%` }}
        ></div>
      </div>
    </div>
  );

  const AnalysisSection = ({ title, data, icon: Icon, color }) => (
    <div className="bg-white rounded-lg p-6 shadow-md border">
      <div className="flex items-center space-x-3 mb-4">
        <Icon className={`w-6 h-6 ${color}`} />
        <h3 className="font-semibold text-gray-800 text-lg">{title}</h3>
      </div>
      
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <h4 className="font-medium text-green-700 mb-2 flex items-center">
            <CheckCircle className="w-4 h-4 mr-2" />
            Points forts
          </h4>
          <ul className="space-y-2">
            {data.pros.map((pro, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-red-700 mb-2 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" />
            Points d'amélioration
          </h4>
          <ul className="space-y-2">
            {data.cons.map((con, index) => (
              <li key={index} className="text-sm text-gray-600 flex items-start">
                <span className="w-2 h-2 bg-red-500 rounded-full mr-2 mt-2 flex-shrink-0"></span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Product Page Scorer
          </h1>
          <p className="text-gray-600">
            Analysez et scorez vos pages produit e-commerce avec l'IA
          </p>
        </div>

        {/* URL Input */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex space-x-4">
            <div className="flex-1">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.exemple-ecommerce.com/produit/..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={loading || !url.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium flex items-center space-x-2 transition-colors"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Analyse...</span>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  <span>Analyser</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results */}
        {results && (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Score Global</h2>
                  <p className="opacity-90 text-sm">
                    {results.url.length > 60 ? results.url.substring(0, 60) + '...' : results.url}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-5xl font-bold">{results.overallScore}</div>
                  <div className="text-sm opacity-90">/ 100</div>
                </div>
              </div>
            </div>

            {/* Score Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <ScoreCard 
                title="Informations Produit" 
                score={results.scores.productInformation}
                icon={Package}
                color="text-blue-600"
              />
              <ScoreCard 
                title="Livraison & Retours" 
                score={results.scores.shippingAndReturns}
                icon={TrendingUp}
                color="text-green-600"
              />
              <ScoreCard 
                title="Confiance" 
                score={results.scores.trustBuilding}
                icon={Shield}
                color="text-purple-600"
              />
            </div>

            {/* Detailed Analysis */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Analyse Détaillée</h2>
              
              <AnalysisSection 
                title="Informations Produit"
                data={results.analysis.productInformation}
                icon={Package}
                color="text-blue-600"
              />
              
              <AnalysisSection 
                title="Livraison & Retours"
                data={results.analysis.shippingAndReturns}
                icon={TrendingUp}
                color="text-green-600"
              />
              
              <AnalysisSection 
                title="Confiance"
                data={results.analysis.trustBuilding}
                icon={Shield}
                color="text-purple-600"
              />
            </div>

            {/* Save Notification */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3" />
                <span className="text-green-800">
                  Résultats sauvegardés dans Google Sheets automatiquement
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductPageScorer;