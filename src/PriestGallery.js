import React, { useState, useEffect } from 'react';
import { FaTrash, FaUpload, FaSpinner } from 'react-icons/fa'; // Import icons
import './PriestGallery.css'; // We will create this new CSS file

const API_BASE = "http://localhost:8080";

const PriestGallery = () => {
    const [images, setImages] = useState([]);
    const [file, setFile] = useState(null);
    const [caption, setCaption] = useState("");
    const [preview, setPreview] = useState(null); // State for image preview URL
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false); // State for upload loading

    const priestId = localStorage.getItem('userId');
    const priestName = localStorage.getItem('firstName');

    const fetchImages = () => {
        if (!priestId) return;
        fetch(`${API_BASE}/api/gallery/priest/${priestId}`)
            .then(res => res.ok ? res.json() : Promise.reject("Failed to fetch images."))
            .then(data => {
                if (Array.isArray(data)) {
                    setImages(data);
                } else {
                    setImages([]);
                    setError("Received invalid data from server.");
                }
            })
            .catch(err => setError(typeof err === 'string' ? err : "Could not load your images."));
    };

    useEffect(() => {
        fetchImages();
    }, [priestId]);

    // Effect to create a preview URL when a file is selected
    useEffect(() => {
        if (!file) {
            setPreview(null);
            return;
        }
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        // Free up memory when the component unmounts or file changes
        return () => URL.revokeObjectURL(objectUrl);
    }, [file]);

    const handleUpload = (e) => {
        e.preventDefault();
        if (!file) { setError("Please select a file to upload."); return; }
        
        setIsUploading(true);
        setError("");
        setMessage("");

        const formData = new FormData();
        formData.append("file", file);
        formData.append("caption", caption);
        formData.append("priestId", priestId);
        formData.append("priestName", priestName);

        fetch(`${API_BASE}/api/gallery/upload`, { method: 'POST', body: formData })
            .then(res => {
                if (!res.ok) return res.json().then(err => { throw new Error(err.error || "Upload failed") });
                return res.json();
            })
            .then(newImage => {
                setImages(prev => [newImage, ...prev]);
                setMessage("Image uploaded successfully!");
                setFile(null); setCaption("");
                e.target.reset();
            })
            .catch(err => setError(err.message))
            .finally(() => setIsUploading(false));
    };

    const handleDelete = (imageId) => {
        if (!window.confirm("Are you sure you want to delete this image?")) return;
        fetch(`${API_BASE}/api/gallery/${imageId}`, { method: 'DELETE' })
            .then(res => {
                if (res.ok) {
                    setImages(prev => prev.filter(img => img.id !== imageId));
                    setMessage("Image deleted.");
                } else { throw new Error("Could not delete image."); }
            })
            .catch(err => setError(err.message));
    };

    return (
        <div className="gallery-container">
            <h1 className="gallery-title">Manage Your Gallery</h1>
            
            <form className="upload-form card" onSubmit={handleUpload}>
                <h2 className="section-title">Upload New Image</h2>
                <p className="section-subtitle">You can upload up to 10 images per month.</p>
                <div className="form-content">
                    <div className="file-upload-area">
                        <label htmlFor="file-upload" className="file-drop-zone">
                            {preview ? (
                                <img src={preview} alt="Preview" className="image-preview" />
                            ) : (
                                <div className="upload-prompt">
                                    <FaUpload />
                                    <span>Drag & drop or click to select a file</span>
                                </div>
                            )}
                        </label>
                        <input id="file-upload" type="file" onChange={(e) => setFile(e.target.files[0])} accept="image/*" />
                    </div>
                    <div className="form-fields">
                        <input type="text" value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Enter a caption (optional)" maxLength="255" />
                        <button type="submit" className="upload-button" disabled={isUploading}>
                            {isUploading ? <FaSpinner className="spinner" /> : 'Upload Image'}
                        </button>
                    </div>
                </div>
                {error && <p className="status-text error-text">{error}</p>}
                {message && <p className="status-text success-text">{message}</p>}
            </form>

            <section className="card">
                <h2 className="section-title">Your Uploaded Images</h2>
                <div className="image-grid">
                    {images.length > 0 ? (
                        images.map(image => (
                            <div key={image.id} className="image-card">
                                <img src={`${API_BASE}${image.imageUrl}`} alt={image.caption} />
                                <div className="image-overlay">
                                    <p className="caption">{image.caption}</p>
                                    <button className="delete-btn" onClick={() => handleDelete(image.id)} title="Delete Image">
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="no-images-text">You have not uploaded any images yet.</p>
                    )}
                </div>
            </section>
        </div>
    );
};

export default PriestGallery;