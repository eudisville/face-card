import React, { useState } from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import './styles/styles.css';
import './styles/generator.css';

function Generator() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [logoEcole, setLogoEcole] = useState(null);
  const [logoCI, setLogoCI] = useState(null);
  const [backgroundImage, setBackgroundImage] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const allMatiere = [
    "Mathématiques", "Français", "Anglais", "Physique-Chimie",
    "SVT", "Histoire-Géographie", "Philosophie", "Éducation Civique",
    "EPS", "Dessin", "Musique", "Informatique"
  ];

  const handleFileUpload = (event) => {
    const selectedFile = event.target.files[0];
    setFile(selectedFile);
    setError('');

    if (selectedFile) {
      const fileType = selectedFile.name.split('.').pop().toLowerCase();
      const reader = new FileReader();

      reader.onload = (e) => {
        let parsedData = [];
        if (fileType === "csv") {
          Papa.parse(selectedFile, {
            header: true,
            complete: (result) => {
              parsedData = result.data;
              setData(parsedData);
            },
            error: (err) => {
              setError(`Erreur lors du parsing du fichier CSV: ${err.message}`);
              setData(null);
            }
          });
        } else if (['xlsx', 'xls'].includes(fileType)) {
          try {
            const binaryString = e.target.result;
            const workbook = XLSX.read(binaryString, { type: 'binary' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            parsedData = XLSX.utils.sheet_to_json(worksheet);
            setData(parsedData);
          } catch (err) {
            setError(`Erreur lors du parsing du fichier Excel: ${err.message}`);
            setData(null);
          }
        } else {
          setError('Format de fichier non supporté. Veuillez utiliser .csv, .xlsx ou .xls.');
          setData(null);
        }
      };

      if (fileType === 'csv') {
        reader.readAsText(selectedFile);
      } else {
        reader.readAsBinaryString(selectedFile);
      }
    }
  };

  const handleLogoUpload = (event, setLogoFunction) => {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
        const reader = new FileReader();
        reader.onload = (e) => {
            setLogoFunction(e.target.result);
        };
        reader.readAsDataURL(selectedImage);
    }
  };

  const handleImageUpload = (event) => {
    const selectedImage = event.target.files[0];
    if (selectedImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target.result);
      };
      reader.readAsDataURL(selectedImage);
    }
  };

  const loadImageFromUrl = async (url) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error(`Erreur lors du chargement de l'image depuis l'URL: ${url}`, error);
      return null;
    }
  };

  const generatePDF = async () => {
    if (!data || data.length === 0) {
      alert("Veuillez d'abord charger un fichier de données valide.");
      return;
    }

    setIsGenerating(true);

    try {
      const doc = new jsPDF({
        unit: 'cm',
        format: 'a4'
      });

      const pageWidth = 21;
      const pageHeight = 29.7;
      const stickerWidth = 7.5;
      const stickerHeight = 4.5;
      const stickerMargin = 0.5; // Marge entre les autocollants

      // Calcul des marges pour un centrage parfait
      const totalStickerWidth = (stickerWidth * 2) + stickerMargin;
      const totalStickerHeight = (stickerHeight * 6) + (stickerMargin * 5);
      const marginX = (pageWidth - totalStickerWidth) / 2;
      const marginY = (pageHeight - totalStickerHeight) / 2;

      let currentX = marginX;
      let currentY = marginY;
      let stickersOnPage = 0;

      for (const eleve of data) {
        for (const matiere of allMatiere) {
          if (stickersOnPage >= 12) {
            doc.addPage();
            currentX = marginX;
            currentY = marginY;
            stickersOnPage = 0;
          }

          if (backgroundImage) {
            doc.addImage(backgroundImage, 'PNG', currentX, currentY, stickerWidth, stickerHeight);
          }
          
          // Définir la couleur et l'épaisseur de la bordure
          doc.setDrawColor(255, 255, 225); // Gris clair
          doc.setLineWidth(0.02645833); // 1px en cm

          // Dessiner le contour de l'autocollant
          doc.rect(currentX, currentY, stickerWidth, stickerHeight);

          if (logoEcole) {
            doc.addImage(logoEcole, 'PNG', currentX + 0.3, currentY + 0.3, 1.2, 1.2);
          }

          if (logoCI) {
            doc.addImage(logoCI, 'PNG', currentX + stickerWidth - 1.5, currentY + 0.3, 1.2, 1.2);
          }

          const photoEleve = eleve["photo eleve"] ? await loadImageFromUrl(eleve["photo eleve"]) : null;
          if (photoEleve) {
            doc.addImage(photoEleve, 'JPEG', currentX + 0.5, currentY + 1.5, 2.5, 2.5);
          }

          doc.setFont('Helvetica', 'bold');
          doc.setTextColor(2, 48, 71);
          
          doc.setTextColor(0, 0, 0)
          doc.setFontSize(5);
          doc.text((eleve["nom ecole"] || '').toUpperCase(), currentX + stickerWidth / 2, currentY + 0.8, { align: 'center' });

          doc.setFont('Helvetica', 'normal');
          doc.setFontSize(5);
          doc.text(eleve.slogan || '', currentX + stickerWidth / 2, currentY + 1, { align: 'center' });

          doc.setTextColor(2, 48, 71);
          doc.setFont('Helvetica', 'bold');
          doc.setFontSize(8);
          doc.text(`${(eleve.nom || '').toUpperCase()}`, currentX + 0.5, currentY + 2.0);
          doc.text(`${(eleve.prenoms || '').toUpperCase()}`, currentX + 0.5, currentY + 2.4);

          doc.setFontSize(8);
          doc.text(`${matiere.toUpperCase()}`, currentX + 0.5, currentY + 2.8);
          doc.text(`${(eleve.classe || '').toUpperCase()}`, currentX + 0.5, currentY + 3.2);

          doc.setFontSize(6);
          doc.text(`NUMERO D'URGENCE: ${(eleve["numero urgence"] || '').toUpperCase()}`, currentX + stickerWidth - 0.5, currentY + stickerHeight - 0.5, { align: 'right' });

          if (stickersOnPage % 2 === 1) {
            currentX = marginX;
            currentY += stickerHeight + stickerMargin;
          } else {
            currentX += stickerWidth + stickerMargin;
          }

          stickersOnPage++;
        }
      }

      doc.save('PRINT_STICKERS.pdf');

    } catch (err) {
      console.error("Une erreur s'est produite lors de la génération du PDF :", err);
      alert("La génération du PDF a échoué. Veuillez vérifier la console pour plus de détails.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <Nav />
      <div className="content">
        <Sidebar />
        <div className="body">
          <div className="header">
            <Header title="Générateur d'autocollants" content="Bienvenue" date="" />
          </div>
          <div className="generator">
            <div className="model">
              <div className="model-items">
                <div className="model-text">
                  <h4>⚡ IMPORTANT : Téléchargez notre modèle Excel !</h4>
                  <p>Pour éviter les erreurs de colonnes manquantes, utilisez notre modèle pré-configuré.</p>
                </div>
                <a href="/modele_autocollants.xlsx" download>
                  <button>Télécharger le modèle</button>
                </a>
              </div>
            </div>
            <div className="generator-main">
              <div className="input-section">
                <input
                  type="file"
                  accept='.csv,.xlsx,.xls'
                  onChange={handleFileUpload}
                  className='file-input'
                />
                {/* Intégration */}
                <p>Logo de l'école</p>
                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => handleLogoUpload(e, setLogoEcole)}
                    className='file-input'
                />

                <p>Logo de la Côte d'Ivoire</p>
                <input
                    type="file"
                    accept=".png,.jpg,.jpeg,.svg"
                    onChange={(e) => handleLogoUpload(e, setLogoCI)}
                    className='file-input'
                />
                
                {file && (
                  <p className="file-status">Fichier sélectionné : {file.name}</p>
                )}
                {error && <p className="error-message">{error}</p>}
                <input
                  type="file"
                  accept='.png,.jpg,.jpeg'
                  onChange={handleImageUpload}
                />
                {backgroundImage && (
                    <p className="file-status">Image d'arrière-plan sélectionnée.</p>
                )}
              </div>
              <button
                onClick={generatePDF}
                disabled={!data || data.length === 0 || isGenerating}
              >
                {isGenerating ? "Génération en cours..." : "Générer les autocollants"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generator;