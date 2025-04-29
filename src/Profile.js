import React, { useEffect, useState } from 'react';
import './Profile.css';
import { FaCamera, FaUser } from 'react-icons/fa';

const Profile = () => {
  const [profile, setProfile] = useState({
    id: '',
    profilePicture: '',
    bio: '',
    mailId: '',
  });

  const [user, setUser] = useState({
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    address: '',
    password: '',
    services: [],
  });

  const [bioEditable, setBioEditable] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  const openModal = (field, value) => {
    setCurrentField(field);
    setCurrentValue(value);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleModalSave = () => {
    if (currentField in user) {
      setUser({ ...user, [currentField]: currentValue });
    } else {
      setProfile({ ...profile, [currentField]: currentValue });
    }
    closeModal();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile((prev) => ({ ...prev, profilePicture: imageUrl }));
      updateProfilePictureOnServer(file);
    }
  };

  const updateProfilePictureOnServer = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('profileId', profile.id);

    try {
      await fetch('http://localhost:8080/api/profile/updateProfilePicture', {
        method: 'POST',
        body: formData,
      });
    } catch (err) {
      console.error('Error uploading image:', err);
    }
  };

  const saveBio = async () => {
    try {
      await fetch('http://localhost:8080/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });
      setBioEditable(false);
    } catch (err) {
      console.error('Error saving bio:', err);
    }
  };

  const fetchProfile = async () => {
    const username = localStorage.getItem('username');
    if (!username) {
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/profile?username=${username}`);
      if (res.ok) {
        const data = await res.json();
        setProfile({
          id: data.id,
          profilePicture: data.profilePicture || '',
          bio: data.bio || '',
          mailId: data.mailId || '',
        });
        setUser({
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username || '',
          phone: data.phone || '',
          address: data.address || '',
          password: data.password || '',
          services: data.services || [],
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-image-wrapper">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="profile-image" />
          ) : (
            <FaUser className="profile-image default-profile-icon" />
          )}
          <label htmlFor="fileInput" className="camera-icon-wrapper">
            <FaCamera className="camera-icon" />
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="fileInput"
            className="profile-file-input"
            style={{ display: 'none' }}
          />
        </div>

        <h2>{user.firstName} {user.lastName}</h2>
        <p className="profile-subtitle" onClick={() => openModal('username', user.username)}>Username: {user.username}</p>
        <p className="profile-subtitle" onClick={() => openModal('phone', user.phone)}>Phone: {user.phone}</p>
        <p className="profile-subtitle" onClick={() => openModal('address', user.address)}>Address: {user.address}</p>
        <p className="profile-subtitle" onClick={() => openModal('mailId', profile.mailId)}>Email (Mail ID): {profile.mailId}</p>
        <p className="profile-subtitle" onClick={() => openModal('password', user.password)}>Password: {user.password}</p>

        <div className="profile-section">
          <label>Bio</label>
          <textarea
            value={profile.bio}
            onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
            disabled={!bioEditable}
            className="profile-input"
          />
          {!bioEditable ? (
            <button onClick={() => setBioEditable(true)} className="profile-edit-btn">Edit Bio</button>
          ) : (
            <button onClick={saveBio} className="profile-save-btn">Save Bio</button>
          )}
        </div>

        <div className="profile-section">
          <label>Pooja Services</label>
          <ul className="services-list">
            {user.services.map((service, idx) => (
              <li key={idx}>{service}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit {currentField}</h3>
            <input
              type="text"
              value={currentValue}
              onChange={(e) => setCurrentValue(e.target.value)}
              className="profile-input"
            />
            <div className="modal-actions">
              <button className="profile-save-btn" onClick={handleModalSave}>Save</button>
              <button className="profile-edit-btn" onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
