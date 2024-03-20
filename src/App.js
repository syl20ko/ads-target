import React, { useState, useEffect } from "react";
import CSVUploader from "./components/CSVUploader";
import HeaderTitle from "./components/HeaderTitle";
import "./App.css";

const calculateValueRanges = (data) => {
  const ranges = {};
  data.forEach((row) => {
    Object.keys(row).forEach((key) => {
      let value = row[key];
      if (typeof value === "string") {
        value = parseFloat(value.replace("%", "").replace("€", ""));
      }
      if (!isNaN(value)) {
        if (!ranges[key]) {
          ranges[key] = { min: value, max: value };
        } else {
          ranges[key].min = Math.min(ranges[key].min, value);
          ranges[key].max = Math.max(ranges[key].max, value);
        }
      }
    });
  });
  return ranges;
};

const getHeatmapColor = (value, min, max) => {
  // Couleur de départ plus claire basée sur votre logo
  const startColor = { r: 94, g: 158, b: 214 }; // Exemple de bleu clair
  // Couleur de fin - la couleur de votre logo
  const endColor = { r: 30, g: 49, b: 100 }; // Couleur de votre logo #1E3164
  const ratio = (value - min) / (max - min);

  // Calcule la couleur intermédiaire
  const r = Math.round(startColor.r + ratio * (endColor.r - startColor.r));
  const g = Math.round(startColor.g + ratio * (endColor.g - startColor.g));
  const b = Math.round(startColor.b + ratio * (endColor.b - startColor.b));

  return `rgb(${r}, ${g}, ${b})`;
};

const App = () => {
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState({ metadataLines: [], metadata: {} });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isUploaded, setIsUploaded] = useState(false);
  const [valueRanges, setValueRanges] = useState({});
  const [isHeatmapActive, setIsHeatmapActive] = useState(true);

  useEffect(() => {
    if (data.length > 0) {
      setValueRanges(calculateValueRanges(data));
    }
  }, [data]);

  const sortedData = data.sort((a, b) => {
    if (!sortConfig || !sortConfig.key) {
      return 0;
    }
    const key = sortConfig.key;
    const aValue =
      typeof a[key] === "string"
        ? parseFloat(a[key].replace("%", "").replace("€", ""))
        : a[key];
    const bValue =
      typeof b[key] === "string"
        ? parseFloat(b[key].replace("%", "").replace("€", ""))
        : b[key];
    if (aValue < bValue) {
      return sortConfig.direction === "ascending" ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === "ascending" ? 1 : -1;
    }
    return 0;
  });

  const requestSort = (key) => {
    let direction = "ascending";
    if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "ascending"
    ) {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const filteredData = sortedData.filter((row) =>
    row["Nom"].toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Style pour les cellules du tableau
  const cellStyleDefault = {
    textAlign: "right",
    fontWeight: "bold",
    color: "black",
    verticalAlign: "middle",
  };

  const cellStyle = {
    textAlign: "right",
    fontWeight: "bold",
    color: "white",
    verticalAlign: "middle",
  };

  return (
    <>
      <HeaderTitle />
      <div className="container mt-3">
        {!isUploaded ? (
          <CSVUploader
            onDataProcessed={(loadedData) => {
              setData(loadedData);
              setIsUploaded(true);
            }}
            onMetadataProcessed={setMetadata}
            onUploadComplete={() => setIsUploaded(true)}
          />
        ) : (
          <>
              <div className="row mt-3 mb-3">
                <div className="col-12">
                  {" "}
                  <button
                    className="btn btn-primary btn-sm pt-0 pb-0 pl-1 pr-1"
                    onClick={() => setIsUploaded(false)}
                  >
                    Importer un autre fichier
                  </button>
                </div>
                <div className="col-md-3 card m-2">
                  <div className="card-body">
                    {" "}
                    {Object.entries(metadata.metadata).map(
                      ([key, value], index) => (
                        <div key={index}>{`${key}: ${value}`}</div>
                      )
                    )}
                  </div>
                </div>
                <div className="col-md-3 card m-2">
                  <div className="card-body">
                    {" "}
                    <div className="form-check">
                      <p>
                        <input
                          className="form-check-input"
                          type="checkbox"
                          checked={isHeatmapActive}
                          onChange={(e) => setIsHeatmapActive(e.target.checked)}
                          id="heatmapToggle"
                        />
                        <label
                          className="form-check-label"
                          htmlFor="heatmapToggle"
                        >
                          Activer la Heatmap
                        </label>
                      </p>
                    </div>
                  </div>
                </div>
              
              </div>
              <div className="row">
                  <div className="col-3 ">
                    <input
                      style={{ width: "100%" }}
                      type="text"
                      className="form-control"
                      placeholder="Rechercher par Nom ..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
           
            <table className="table table-striped mt-3">
              <thead className="table-dark">
                <tr>
                  {[
                    "Nom",
                    "Articles consultés",
                    "Articles ajoutés au panier",
                    "Articles achetés",
                    "Ratio panier/consulté",
                    "Ratio achat/consulté",
                    "Ratio achat/panier",
                    "Revenu généré par l'article",
                    "CA moyen/article acheté",
                    "CA moyen/article consulté",
                  ].map((header) => (
                    <th key={header} onClick={() => requestSort(header)}>
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredData.map((row, index) => (
                  <tr key={index}>
                    {Object.keys(row).map((key, cellIndex) => {
                      let displayValue = row[key];
                      let style = {};

                      // Appliquer le style uniquement si ce n'est pas la première colonne
                      if (
                        cellIndex !== 0 &&
                        isHeatmapActive &&
                        valueRanges[key]
                      ) {
                        style = {
                          ...cellStyle,
                          backgroundColor: getHeatmapColor(
                            parseFloat(row[key]),
                            valueRanges[key].min,
                            valueRanges[key].max
                          ),
                        };
                      } else if (
                        cellIndex !== 0 &&
                        !isHeatmapActive &&
                        valueRanges[key]
                      ) {
                        style = {
                          ...cellStyleDefault,
                        };
                      }

                      // Vérifier et formater spécifiquement les valeurs numériques pour les colonnes monétaires et de pourcentage
                      if (typeof row[key]) {
                        if (
                          key === "CA moyen/article acheté" ||
                          key === "CA moyen/article consulté"
                        ) {
                          displayValue = `${row[key]}€`;
                        } else if (key === "Revenu généré par l'article") {
                          displayValue = `${row[key].toFixed(2)}€`;
                        } else if (
                          key === "Ratio panier/consulté" ||
                          key === "Ratio achat/consulté" ||
                          key === "Ratio achat/panier"
                        ) {
                          displayValue = `${row[key]}%`;
                        } else {
                          displayValue = row[key]; // Appliquer le formatage numérique général
                        }
                      } else if (
                        typeof row[key] === "string" &&
                        row[key].includes("%")
                      ) {
                        // Pour les valeurs déjà sous forme de chaîne contenant un pourcentage
                        displayValue = `${parseFloat(row[key])}%`;
                      } else if (
                        typeof row[key] === "string" &&
                        row[key].includes("€")
                      ) {
                        // Pour les valeurs déjà sous forme de chaîne contenant un symbole euro
                        displayValue = `${parseFloat(row[key])}€`;
                      }

                      // Ne pas appliquer le style cellStyle à la première colonne
                      if (cellIndex === 0) {
                        return <td key={key}>{displayValue}</td>;
                      } else {
                        return (
                          <td key={key} style={style}>
                            {displayValue}
                          </td>
                        );
                      }
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </>
  );
};

export default App;
