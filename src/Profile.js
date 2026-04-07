import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Cropper from 'react-easy-crop';
import getCroppedImg from './cropImage'; 
import { FaCamera, FaUser, FaIdCard, FaMapMarkerAlt, FaCheck, FaTrash, FaSpinner, FaTimes } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Profile.css';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const Profile = () => {
  const [profileData, setProfileData] = useState({
    profileId: '', userId: '', firstName: '', lastName: '',
    phone: '', addressLine1: '', addressLine2: '', city: '', state: '',
    zipCode: '', email: '', profilePicture: '', role: '',
  });

  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('personal');

  // Cropper
  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const userEmail = localStorage.getItem('userEmail');

  const fetchProfileData = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/profile?email=${userEmail}`);
      const data = res.data;
      const formatted = { ...data, profilePicture: data.profilePicture ? `${API_URL}${data.profilePicture}` : '' };
      setProfileData(formatted);
      setOriginalProfileData(formatted);
    } catch (error) {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => { fetchProfileData(); }, [fetchProfileData]);

  const isChanged = () => JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.readAsDataURL(e.target.files[0]);
      reader.onload = () => setImageToCrop(reader.result);
    }
  };

  const handleUploadCroppedImage = async () => {
    setSaving(true);
    try {
      const croppedBlob = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const formData = new FormData();
      formData.append('profilePicture', croppedBlob, 'profile.jpg');
      formData.append('profileId', profileData.profileId);
      const res = await axios.post(`${API_URL}/api/profile/updateProfilePicture`, formData);
      setProfileData(prev => ({ ...prev, profilePicture: `${API_URL}${res.data.newPath}` }));
      setImageToCrop(null);
      toast.success("Photo updated!");
    } catch (err) { toast.error("Upload failed."); }
    finally { setSaving(false); }
  };

  const handleSaveChanges = async () => {
    setSaving(true);
    try {
      await axios.post(`${API_URL}/api/profile/update`, { ...profileData, mailId: profileData.email });
      setOriginalProfileData(profileData);
      toast.success("Profile saved!");
    } catch (err) { toast.error("Save failed."); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="p-loader">Connecting...</div>;

  return (
    <div className="p-page-wrapper">
      <ToastContainer position="bottom-right" />

      {imageToCrop && (
        <div className="p-crop-modal">
          <div className="p-crop-container">
            <Cropper image={imageToCrop} crop={crop} zoom={zoom} aspect={1} cropShape="round" onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={(u, p) => setCroppedAreaPixels(p)} />
          </div>
          <div className="p-crop-controls">
            <input type="range" value={zoom} min={1} max={3} step={0.1} onChange={(e) => setZoom(e.target.value)} className="p-zoom-slider" />
            <div className="p-crop-btns">
              <button onClick={() => setImageToCrop(null)} className="p-btn-cancel-crop">Cancel</button>
              <button onClick={handleUploadCroppedImage} className="p-btn-save-crop">Set Photo</button>
            </div>
          </div>
        </div>
      )}

      <div className="p-card-container">
        {/* SIDEBAR */}
        <aside className="p-sidebar">
          <div className="p-profile-preview">
            <div className="p-avatar-wrapper">
              <div className="p-avatar-circle">
                {profileData.profilePicture ? <img src={profileData.profilePicture} alt="User" /> : <FaUser className="p-icon-placeholder" />}
              </div>
              <label htmlFor="p-upload" className="p-camera-overlay"><FaCamera /></label>
              <input type="file" id="p-upload" hidden onChange={onFileChange} accept="image/*" />
            </div>
            <h3>{profileData.firstName} {profileData.lastName}</h3>
            <span className="p-role-label">{profileData.role}</span>
          </div>

          <nav className="p-nav">
            <button className={activeTab === 'personal' ? 'active' : ''} onClick={() => setActiveTab('personal')}>
              <FaIdCard /> Personal Info
            </button>
            <button className={activeTab === 'address' ? 'active' : ''} onClick={() => setActiveTab('address')}>
              <FaMapMarkerAlt /> Address Details
            </button>
          </nav>
        </aside>

        {/* CONTENT */}
        <main className="p-content">
          <header className="p-header">
            <h2>{activeTab === 'personal' ? 'Personal Details' : 'Address Details'}</h2>
            <p>Update your information to ensure a seamless experience.</p>
          </header>

          <div className="p-form-area">
            {activeTab === 'personal' ? (
              <div className="p-grid fade-in">
                <div className="p-input-group"><label>First Name</label><input value={profileData.firstName} onChange={e => setProfileData({...profileData, firstName: e.target.value})} /></div>
                <div className="p-input-group"><label>Last Name</label><input value={profileData.lastName} onChange={e => setProfileData({...profileData, lastName: e.target.value})} /></div>
                <div className="p-input-group full"><label>Email Address (Primary)</label><input value={profileData.email} readOnly className="p-disabled" /></div>
                <div className="p-input-group"><label>Phone Number</label><input type="tel" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})} /></div>
              </div>
            ) : (
              <div className="p-grid fade-in">
                <div className="p-input-group full"><label>Street Address</label><input value={profileData.addressLine1} onChange={e => setProfileData({...profileData, addressLine1: e.target.value})} /></div>
                <div className="p-input-group full"><label>Suite / Apartment</label><input value={profileData.addressLine2} onChange={e => setProfileData({...profileData, addressLine2: e.target.value})} /></div>
                <div className="p-input-group"><label>City</label><input value={profileData.city} onChange={e => setProfileData({...profileData, city: e.target.value})} /></div>
                <div className="p-input-group mini"><label>State</label><input value={profileData.state} onChange={e => setProfileData({...profileData, state: e.target.value})} /></div>
                <div className="p-input-group mini"><label>Zip Code</label><input value={profileData.zipCode} onChange={e => setProfileData({...profileData, zipCode: e.target.value})} /></div>
              </div>
            )}
          </div>

          <footer className="p-footer">
            <button className="p-btn-discard" disabled={!isChanged() || saving} onClick={() => setProfileData(originalProfileData)}>
              <FaTimes /> Discard
            </button>
            <button className="p-btn-save" disabled={!isChanged() || saving} onClick={handleSaveChanges}>
              {saving ? <FaSpinner className="p-spin" /> : <><FaCheck /> Save Changes</>}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Profile;