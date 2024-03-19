import React from 'react';
import Papa from 'papaparse';

const CSVUploader = ({ onDataProcessed, onMetadataProcessed, onUploadComplete }) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      complete: function(results) {
        const data = results.data;
        let metadata = {};
        let metadataLines = [];
        let dataIndex = 0;

        // Identifier et extraire les métadonnées
        for (let i = 0; i < data.length; i++) {
          if (data[i].length === 1 && data[i][0].startsWith('#')) {
            const line = data[i][0].substring(1).trim();
            if (line.includes(':')) {
              const parts = line.split(':');
              metadata[parts[0].trim()] = parts[1].trim();
            } else {
              metadataLines.push(line);
            }
          } else {
            dataIndex = i + 1; // Sauter la ligne d'en-tête
            break;
          }
        }


        const parsedData = data.slice(dataIndex).map(row => {
          const articlesConsultes = parseInt(row[1], 10) || 0;
          const articlesAjoutesAuPanier = parseInt(row[2], 10) || 0;
          const articlesAchetes = parseInt(row[3], 10) || 0;
          const revenuGenere = parseFloat(row[4]) || 0.0;
        
          return {
            'Nom': row[0],
            'Articles consultés': articlesConsultes,
            'Articles ajoutés au panier': articlesAjoutesAuPanier,
            'Articles achetés': articlesAchetes,
            'Ratio panier/consulté': articlesConsultes > 0 ? ((articlesAjoutesAuPanier / articlesConsultes) * 100).toFixed(2) + '%' : '0%',
            'Ratio achat/consulté': articlesConsultes > 0 ? ((articlesAchetes / articlesConsultes) * 100).toFixed(2) + '%' : '0%',
            'Ratio achat/panier': articlesAjoutesAuPanier > 0 ? ((articlesAchetes / articlesAjoutesAuPanier) * 100).toFixed(2) + '%' : '0%',
            'Revenu généré par l\'article': parseFloat(row[4]) || 0.0,
            'CA moyen/article acheté': articlesAchetes > 0 ? (revenuGenere / articlesAchetes).toFixed(2) + '€' : '0€',
            'CA moyen/article consulté': articlesConsultes > 0 ? (revenuGenere / articlesConsultes).toFixed(2) + '€' : '0€',
          };
        });
        	
        onMetadataProcessed({ metadata, metadataLines });
        onDataProcessed(parsedData);
        onUploadComplete(true); // Indique que l'upload est terminé
      },
      skipEmptyLines: true,
      header: false
    });
  };

  return (
    <div className='row'>
      <div className="col-md-6 offset-md-3"><input className='form-control' type="file" accept=".csv" onChange={handleFileChange} /></div>
    </div>
  );
};

export default CSVUploader;