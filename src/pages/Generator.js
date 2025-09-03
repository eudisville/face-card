import React, { useState, useEffect } from 'react';
import Nav from '../components/Nav';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { supabase } from '../supabase/supabaseClient'; // Importez le client Supabase
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
  const [userId, setUserId] = useState(null); // Nouvel état pour l'ID de l'utilisateur

  // Gérer l'authentification de l'utilisateur
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setUserId(session.user.id);
        } else {
          setUserId(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

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

  const generatePDF = async () => {
    if (!data || data.length === 0) {
      alert("Veuillez d'abord charger un fichier de données valide.");
      return;
    }
    if (!userId) {
      alert("Veuillez vous connecter pour générer et sauvegarder le PDF.");
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
      const stickerMargin = 0.3;

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

          doc.setDrawColor(255, 255, 225);
          doc.setLineWidth(0.02645833);
          doc.rect(currentX, currentY, stickerWidth, stickerHeight);

          if (logoEcole) {
            doc.addImage(logoEcole, 'PNG', currentX + 0.3, currentY + 0.3, 1.2, 1.2);
          }

          if (logoCI) {
            doc.addImage(logoCI, 'PNG', currentX + stickerWidth - 1.5, currentY + 0.3, 1.2, 1.2);
          }

          const key = `${(eleve.nom || '').trim()} ${(eleve.prenoms || '').trim()}`.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
          const photoEleve = studentPhotos[key];

          const photoX = currentX + 5.5;
          const photoY = currentY + 1.7;
          const photoWidth = 1.5;
          const photoHeight = 1.8;
          const borderRadius = 0.1;
          const borderWidth = 0.03;

          if (photoEleve) {
            doc.addImage(photoEleve, 'JPEG', photoX, photoY, photoWidth, photoHeight);
            doc.setDrawColor(2, 48, 71);
            doc.setLineWidth(borderWidth);
            doc.roundedRect(photoX, photoY, photoWidth, photoHeight, borderRadius, borderRadius, 'S');
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
          doc.text(`${(eleve.prenoms || '').toUpperCase()}`, currentX + 0.5, currentY + 2.3);

          doc.setFontSize(8);
          doc.text(`${matiere.toUpperCase()}`, currentX + 0.5, currentY + 2.6);
          doc.text(`${(eleve.matricule || '').toUpperCase()}`, currentX + 0.5, currentY + 2.9);
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

      // Récupérer le PDF en tant que Blob
      const pdfBlob = doc.output('blob');
      const fileName = `STICKERS_${new Date().toISOString()}.pdf`;
      const storagePath = `${userId}/${fileName}`;

      // Téléverser le fichier sur Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pdfs')
        .upload(storagePath, pdfBlob, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error("Erreur lors de l'upload du fichier:", uploadError);
        throw new Error("Erreur lors du téléversement du PDF.");
      }

      // Calculer le nombre d'élèves et d'écoles
      const studentCount = data.length;
      const schoolNames = data.map(eleve => eleve["nom ecole"]);
      const uniqueSchools = [...new Set(schoolNames)];
      const schoolCount = uniqueSchools.length;

      // Récupérer l'URL publique du fichier
      const { data: { publicUrl } } = supabase.storage
        .from('pdfs')
        .getPublicUrl(storagePath);

      // Enregistrer la génération dans la base de données
      // La variable 'uploadData.path' contient déjà le chemin de stockage nécessaire
      const { data: dbInsertData, error: dbError } = await supabase
        .from('generations')
        .insert({
          user_id: userId,
          file_name: fileName,
          file_path: uploadData.path,
          nombre_eleves: studentCount,
          nombre_ecoles: schoolCount,
        });

        if (dbError) {
          console.error("Erreur lors de la sauvegarde dans la BDD:", dbError);
          throw new Error("Erreur lors de la sauvegarde dans la base de données.");
        }

        // Réinitialiser les états des fichiers après une génération réussie
        setFile(null);
        setData(null);
        setLogoEcole(null);
        setLogoCI(null);
        setStudentPhotos({});
        setBackgroundImage(null);

        // Réinitialiser la valeur des champs de saisie de type 'file'
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
          input.value = '';
        });

      alert("PDF généré et sauvegardé avec succès ! Vous pouvez le retrouver dans l'Historique.");
      doc.save(fileName); // Télécharge aussi le fichier localement
    } catch (err) {
      console.error("Une erreur s'est produite :", err);
      alert(`La génération du PDF a échoué. Détails: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <div className="nav">
        <Nav />
      </div>
      <div className="content">
        <div className="bar">
          <Sidebar />
        </div>
        <div className="body">
          <div className="header">
            <Header title="Générateur d'autocollants" content="Importez votre fichier Excel et générez automatiquement 1 PDF A4 par élève (12 autocollants identiques)" date="" />
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
            <div className="note">
              <p>NB : Les noms des photos dans le fichier ZIP doivent correspondre aux colonnes noms et prénoms dans le fichier Excel.
              Fichier Excel [ nom : YAO, prenoms : Jean ] - Nom image : YAO Jean.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Generator;