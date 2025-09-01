import React, { useState } from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import JSZip from 'jszip';
import './styles/styles.css';
import './styles/generator.css';

function Generator() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [logoEcole, setLogoEcole] = useState(null);
  const [logoCI, setLogoCI] = useState(null);
  const [studentPhotos, setStudentPhotos] = useState({});
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

  const handleZipUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
        const zip = await JSZip.loadAsync(file);
        const photoMap = {};

        await Promise.all(
            Object.keys(zip.files).map(async (filename) => {
                const zipEntry = zip.files[filename];
                if (!zipEntry.dir) {
                    const content = await zipEntry.async('base64');
                    const dataUrl = `data:image/${filename.split('.').pop()};base64,${content}`;

                    // Extraction du nom de fichier sans le chemin et l'extension
                    const fileNameWithoutPath = filename.substring(filename.lastIndexOf('/') + 1);
                    const normalizedName = fileNameWithoutPath.split('.')[0].replace(/%20/g, ' ').trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    photoMap[normalizedName] = dataUrl;
                }
            })
        );
        setStudentPhotos(photoMap);
        console.log("Photos du ZIP chargées avec succès.", photoMap);
    } catch (err) {
        console.error("Erreur lors de la lecture du fichier ZIP :", err);
        setError("Erreur lors de la lecture du fichier ZIP.");
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

  // const loadImageFromUrl = async (url) => {
  //   try {
  //     const response = await fetch(url);
  //     const blob = await response.blob();
  //     return new Promise((resolve, reject) => {
  //       const reader = new FileReader();
  //       reader.onloadend = () => resolve(reader.result);
  //       reader.onerror = reject;
  //       reader.readAsDataURL(blob);
  //     });
  //   } catch (error) {
  //     console.error(`Erreur lors du chargement de l'image depuis l'URL: ${url}`, error);
  //     return null;
  //   }
  // };

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

          // MISE À JOUR : Normalisation de la clé pour trouver la photo
          const key = `${(eleve.nom || '').trim()} ${(eleve.prenoms || '').trim()}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const photoEleve = studentPhotos[key];

          // Définir les dimensions et la position de la photo
          const photoX = currentX + 5.5; // Coordonnée X de la photo
          const photoY = currentY + 1.7; // Coordonnée Y de la photo
          const photoWidth = 1.5; // Largeur de la photo
          const photoHeight = 1.5; // Hauteur de la photo
          const borderRadius = 0.1; // Rayon de la bordure arrondie en cm (équivalent à 1mm ou 10px / 10 = 1mm)
          const borderWidth = 0.02; // Largeur de la bordure en cm (2px = 0.02cm)

          if (photoEleve) {
            // Ajoute la photo
            doc.addImage(photoEleve, 'JPEG', photoX, photoY, photoWidth, photoHeight);

            // Dessine la bordure verte arrondie autour de la photo
            doc.setDrawColor(0, 128, 0); // Couleur verte (RGB)
            doc.setLineWidth(borderWidth); // Largeur de la bordure (2px)

            // Dessine un rectangle arrondi avec la bordure
            // Les coordonnées et dimensions doivent inclure la bordure
            doc.roundedRect(
                photoX,
                photoY,
                photoWidth,
                photoHeight,
                borderRadius,
                borderRadius,
                'S' // 'S' pour stroke (bordure seulement)
            );
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

                <div className="inputs">
                  <div className="excel-file">
                    <input
                      type="file"
                      accept='.csv,.xlsx,.xls'
                      onChange={handleFileUpload}
                      className='file-input'
                      id='data-file-input'
                    />
                    <label htmlFor="data-file-input" className="custom-file-upload">
                      Charger le fichier Excel
                    </label>
                    {file && (
                      <p className="file-status">{file.name}</p>
                    )}
                  </div>

                  <div className="logo-ecole">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={(e) => handleLogoUpload(e, setLogoEcole)}
                      className='file-input'
                      id='logo-ecole-input'
                    />
                    <label htmlFor="logo-ecole-input" className="custom-file-upload">
                      Charger le logo (école)
                    </label>
                    {logoEcole && (
                      <p className="file-status">Logo sélectionné.</p>
                    )}
                  </div>

                  <div className="logo-ci">
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      onChange={(e) => handleLogoUpload(e, setLogoCI)}
                      className='file-input'
                      id='logo-ci-input'
                    />
                    <label htmlFor="logo-ci-input" className="custom-file-upload">
                      Charger le logo (Embleme CI)
                    </label>
                    {logoCI && (
                      <p className="file-status">Logo sélectionné.</p>
                    )}
                  </div>

                  <div className="zip-file">
                    <input
                      type="file"
                      accept=".zip"
                      onChange={handleZipUpload}
                      className='file-input'
                      id='zip-file-input'
                    />
                    <label htmlFor="zip-file-input" className="custom-file-upload">
                      Fichier ZIP Photos
                    </label>
                    {Object.keys(studentPhotos).length > 0 && (
                      <p className="file-status">Photos du ZIP chargées.</p>
                    )}
                  </div>
                  <div className="background-image">
                    <input
                      type="file"
                      accept='.png,.jpg,.jpeg'
                      onChange={handleImageUpload}
                      className='file-input'
                      id='background-image-input'
                    />
                    <label htmlFor="background-image-input" className="custom-file-upload">
                      Image d'arrière-plan
                    </label>
                    {backgroundImage && (
                      <p className="file-status">Image sélectionnée.</p>
                    )}
                  </div>
                </div>
                
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