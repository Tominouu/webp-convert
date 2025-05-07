import { useState, useRef } from 'react'
import imageCompression from 'browser-image-compression'
import './App.css'

function App() {
  const [images, setImages] = useState([])
  const [convertedImages, setConvertedImages] = useState([])
  const [isConverting, setIsConverting] = useState(false)
  const [progress, setProgress] = useState(0)
  const fileInputRef = useRef(null)
  const folderInputRef = useRef(null)

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return
    
    setImages(files)
    setConvertedImages([])
    setProgress(0)
  }

  const handleFolderChange = async (e) => {
    const files = Array.from(e.target.files).filter(file => file.type.startsWith('image/'))
    if (files.length === 0) return
    
    setImages(files)
    setConvertedImages([])
    setProgress(0)
  }

  const convertToWebP = async () => {
    if (images.length === 0) return
    
    setIsConverting(true)
    setConvertedImages([])
    setProgress(0)
    
    const converted = []
    
    for (let i = 0; i < images.length; i++) {
      const file = images[i]
      
      try {
        // Options de compression
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1920,
          useWebWorker: true,
          fileType: 'image/webp'
        }
        
        // Compression de l'image
        const compressedFile = await imageCompression(file, options)
        
        // Création d'un objet avec les informations de l'image convertie
        converted.push({
          original: file,
          converted: compressedFile,
          name: file.name.replace(/\.[^\.]+$/, '.webp'),
          url: URL.createObjectURL(compressedFile),
          size: compressedFile.size,
          originalSize: file.size
        })
        
        // Mise à jour de la progression
        setProgress(Math.round(((i + 1) / images.length) * 100))
      } catch (error) {
        console.error(`Erreur lors de la conversion de ${file.name}:`, error)
      }
    }
    
    setConvertedImages(converted)
    setIsConverting(false)
  }

  const downloadImage = (image) => {
    const link = document.createElement('a')
    link.href = image.url
    link.download = image.name
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const downloadAllImages = () => {
    convertedImages.forEach(image => {
      downloadImage(image)
    })
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(2) + ' KB'
    else return (bytes / 1048576).toFixed(2) + ' MB'
  }

  const calculateSavings = (original, converted) => {
    const savings = original - converted
    const percentage = Math.round((savings / original) * 100)
    return `${percentage}% (${formatSize(savings)})`
  }

  return (
    <div className="container">
      <header>
        <h1>WebP Converter</h1>
        <p>Convertissez et compressez vos images en format WebP</p>
      </header>

      <div className="upload-section">
        <div className="upload-box">
          <h2>Télécharger des images</h2>
          <div className="upload-buttons">
            <button 
              className="upload-btn" 
              onClick={() => fileInputRef.current.click()}
            >
              Sélectionner des images
            </button>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleFileChange} 
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            
            <button 
              className="upload-btn" 
              onClick={() => folderInputRef.current.click()}
            >
              Sélectionner un dossier
            </button>
            <input 
              type="file" 
              ref={folderInputRef}
              onChange={handleFolderChange} 
              directory="" 
              webkitdirectory="" 
              mozdirectory=""
              multiple 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
          </div>
        </div>

        {images.length > 0 && (
          <div className="info-box">
            <p>{images.length} image(s) sélectionnée(s)</p>
            <button 
              className="convert-btn" 
              onClick={convertToWebP} 
              disabled={isConverting}
            >
              {isConverting ? 'Conversion en cours...' : 'Convertir en WebP'}
            </button>
          </div>
        )}

        {isConverting && (
          <div className="progress-bar">
            <div 
              className="progress" 
              style={{ width: `${progress}%` }}
            ></div>
            <span>{progress}%</span>
          </div>
        )}
      </div>

      {convertedImages.length > 0 && (
        <div className="results-section">
          <div className="results-header">
            <h2>Images converties</h2>
            <button className="download-all-btn" onClick={downloadAllImages}>
              Télécharger toutes les images
            </button>
          </div>
          
          <div className="results-table">
            <table>
              <thead>
                <tr>
                  <th>Aperçu</th>
                  <th>Nom</th>
                  <th>Taille originale</th>
                  <th>Nouvelle taille</th>
                  <th>Économie</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {convertedImages.map((image, index) => (
                  <tr key={index}>
                    <td>
                      <img src={image.url} alt={image.name} className="preview-img" />
                    </td>
                    <td>{image.name}</td>
                    <td>{formatSize(image.originalSize)}</td>
                    <td>{formatSize(image.size)}</td>
                    <td>{calculateSavings(image.originalSize, image.size)}</td>
                    <td>
                      <button 
                        className="download-btn" 
                        onClick={() => downloadImage(image)}
                      >
                        Télécharger
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <footer>
        <p>WebP Converter - Convertissez et compressez vos images facilement</p>
        <div className="legal-notice">
          <p>Mentions légales :</p>
          <ul>
            <li>Toutes les images sont traitées localement dans votre navigateur</li>
            <li>Aucune donnée n'est stockée sur des serveurs distants</li>
            <li>Aucune information personnelle n'est collectée</li>
            <li>L'application respecte votre vie privée à 100%</li>
          </ul>
        </div>
      </footer>
    </div>
  )
}

export default App