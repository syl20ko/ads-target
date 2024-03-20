import React from "react";
import Papa from "papaparse";

const CSVUploader = ({
  onDataProcessed,
  onMetadataProcessed,
  onUploadComplete,
  setParetoValues
}) => {
  const handleFileChange = (event) => {
    const file = event.target.files[0];

    Papa.parse(file, {
      complete: function (results) {
        const data = results.data;
        let metadata = {};
        let metadataLines = [];
        let dataIndex = 0;

        // Identifier et extraire les métadonnées
        for (let i = 0; i < data.length; i++) {
          if (data[i].length === 1 && data[i][0].startsWith("#")) {
            const line = data[i][0].substring(1).trim();
            if (line.includes(":")) {
              const parts = line.split(":");
              metadata[parts[0].trim()] = parts[1].trim();
            } else {
              metadataLines.push(line);
            }
          } else {
            dataIndex = i + 1; // Sauter la ligne d'en-tête
            break;
          }
        }

        const parsedData = data.slice(dataIndex).map((row) => {
          const articlesConsultes = parseInt(row[1], 10) || 0;
          const articlesAjoutesAuPanier = parseInt(row[2], 10) || 0;
          const articlesAchetes = parseInt(row[3], 10) || 0;
          const revenuGenere = parseFloat(row[4]) || 0.0;

          return {
            Nom: row[0],
            "Articles consultés": articlesConsultes,
            "Articles ajoutés au panier": articlesAjoutesAuPanier,
            "Articles achetés": articlesAchetes,
            "Ratio panier/consulté":
              articlesConsultes > 0
                ? ((articlesAjoutesAuPanier / articlesConsultes) * 100).toFixed(
                    2
                  )
                : "0",
            "Ratio achat/consulté":
              articlesConsultes > 0
                ? ((articlesAchetes / articlesConsultes) * 100).toFixed(2)
                : "0",
            "Ratio achat/panier":
              articlesAjoutesAuPanier > 0
                ? ((articlesAchetes / articlesAjoutesAuPanier) * 100).toFixed(2)
                : "0",
            "Revenu généré par l'article": parseFloat(row[4]) || 0.0,
            "CA moyen/article acheté":
              articlesAchetes > 0
                ? (revenuGenere / articlesAchetes).toFixed(2)
                : "0",
            "CA moyen/article consulté":
              articlesConsultes > 0
                ? (revenuGenere / articlesConsultes).toFixed(2)
                : "0",
          };
        });

        onMetadataProcessed({ metadata, metadataLines });
        onDataProcessed(parsedData);
        onUploadComplete(true); // Indique que l'upload est terminé

        // Après avoir créé `parsedData` dans votre fonction `complete` de Papa.parse
        const totalRevenu = parsedData.reduce(
          (acc, cur) => acc + cur["Revenu généré par l'article"],
          0
        );
        const seuilPareto = totalRevenu * 0.8;

        // Triez les produits par revenus générés dans l'ordre décroissant
        const produitsTries = parsedData.sort(
          (a, b) =>
            b["Revenu généré par l'article"] - a["Revenu généré par l'article"]
        );

        // Accumulez les revenus jusqu'à atteindre 80% du total
        let sommeCumulee = 0;
        const produitsPareto = produitsTries.filter((produit) => {
          sommeCumulee += produit["Revenu généré par l'article"];
          return sommeCumulee <= seuilPareto;
        });

        setParetoValues(produitsPareto)
        // `produitsPareto` contient maintenant les 20% des produits qui génèrent 80% des revenus
        // Vous pouvez marquer ces produits d'une manière spécifique ou les traiter différemment dans votre application

        // N'oubliez pas de passer `produitsPareto` ou une indication de leur statut Pareto à votre composant d'affichage pour une utilisation ultérieure
      },
      skipEmptyLines: true,
      header: false,
    });
  };

  return (
    <div className="row mt-4">
      <div className="col-md-6 offset-md-3">
        <div className="card">
          <div className="card-header">Importer votre fichier CSV</div>
          <div className="card-body">
            {" "}
            <div className="text-center mb-4">
              <h3>Analyse produits / catégories</h3>
              <small>GA4 ECOMMERCE AVANCÉ</small>
              <hr />
              <p>
                À partir de vos données extraites de{" "}
                <strong>Google Analytics 4</strong> e-commerce avancé,{" "}
                <strong>Ads Target</strong> va automatiquement mettre en lumière
                les actions à mener pour améliorer vos ventes.
              </p>
            </div>
            <div className="col-md-8 offset-md-2 mb-5">
              <input
                className="form-control"
                type="file"
                accept=".csv"
                onChange={handleFileChange}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CSVUploader;
