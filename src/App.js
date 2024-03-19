import React, { useState, useMemo } from "react";
import CSVUploader from "./components/CSVUploader";
import HeaderTitle from "./components/HeaderTitle";
import './App.css';


const App = () => {
  const [data, setData] = useState([]);
  const [metadata, setMetadata] = useState({ metadataLines: [], metadata: {} });
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [isUploaded, setIsUploaded] = useState(false);

  const sortedData = useMemo(() => {
    let sortableItems = [...data];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [data, sortConfig]);

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

  const filteredData = sortedData.filter(
    (row) => row["Nom"].toLowerCase().includes(searchTerm.toLowerCase()) // Changé de 'Nom de l\'article'
  );

  return (
    <>
     <HeaderTitle />
      <div className="container mt-3">
        <div className="row">
          <div className="col-12 mt-3 text-center">
            <p className="slogan">
              Objectifs, rentabilité & stratégies publicitaires
             <br />  Google Ads {"     "}
              <img
            src="./ads-taget/adslogo.png"
            className="logoAds"
            alt="google ads"
          />
            </p>
          </div>
        </div>
      </div>
    <div className="container">
      {!isUploaded ? (
        <CSVUploader
          onDataProcessed={setData}
          onMetadataProcessed={setMetadata}
          onUploadComplete={() => setIsUploaded(true)}

        />
      ) : (
        <>
          <div>
            {metadata.metadataLines.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
            {Object.entries(metadata.metadata).map(([key, value], index) => (
              <div key={index}>{`${key}: ${value}`}</div>
            ))}
          </div>
          <div className="mt-3 mb-3">
            <input
              type="text"
              className="form-control"
              placeholder="Rechercher par nom."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
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
                  <td>{row["Nom"]}</td> {/* Changé de 'Nom de l\'article' */}
                  <td>{row["Articles consultés"]}</td>
                  <td>{row["Articles ajoutés au panier"]}</td>
                  <td>{row["Articles achetés"]}</td>
                  <td>{row["Ratio panier/consulté"]}</td>
                  <td>{row["Ratio achat/consulté"]}</td>
                  <td>{row["Ratio achat/panier"]}</td>
                  <td>{`${row["Revenu généré par l'article"].toFixed(2)}€`}</td>
                  <td>{row["CA moyen/article acheté"]}</td>
                  <td>{row["CA moyen/article consulté"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div></>
  );

};

export default App;
