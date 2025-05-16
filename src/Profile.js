import React, { useEffect, useState } from 'react';
import './Profile.css';
import { FaCamera, FaUser, FaCopy } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Profile = () => {
  const [profile, setProfile] = useState({
    id: '',
    profilePicture: '',
    bio: '',
    mailId: '',
  });

  const [user, setUser] = useState({
    id: '',
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    address: '',
    password: '',
    services: [],
  });

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentField, setCurrentField] = useState('');
  const [currentValue, setCurrentValue] = useState('');

  const role = localStorage.getItem('role'); // 'priest' or 'customer'

  const openModal = (field, value) => {
    setCurrentField(field);
    if (field === 'services') {
      setCurrentValue(value.join(', '));
    } else if (field === 'password') {
      // Do not show plain password in modal, show empty or placeholder
      setCurrentValue('');
    } else {
      setCurrentValue(value || '');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleModalSave = async () => {
    let updatedUser = { ...user };
    let updatedProfile = { ...profile };

    if (currentField === 'services') {
      updatedUser.services = currentValue
        .split(',')
        .map(s => s.trim())
        .filter(s => s);
    } else if (currentField === 'password') {
      if (currentValue.trim()) {
        updatedUser.password = currentValue.trim();
      }
      // If empty, do not update password
    } else if (currentField in user) {
      updatedUser[currentField] = currentValue;
    } else {
      updatedProfile[currentField] = currentValue;
    }

    setUser(updatedUser);
    setProfile(updatedProfile);
    closeModal();

    try {
      // Update User fields
      const userRes = await fetch('http://localhost:8080/api/auth/updateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!userRes.ok) throw new Error('User update failed');

      // Update Profile fields
      const profileRes = await fetch('http://localhost:8080/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });

      if (!profileRes.ok) throw new Error('Profile update failed');

      toast.success('Profile updated successfully!');
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update profile.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfile(prev => ({ ...prev, profilePicture: imageUrl }));
      updateProfilePictureOnServer(file);
    }
  };

  const updateProfilePictureOnServer = async (file) => {
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('profileId', profile.id);

    try {
      const res = await fetch('http://localhost:8080/api/profile/updateProfilePicture', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        toast.success('Profile picture updated!');
        // Optionally refresh profile data here
      } else {
        toast.error('Failed to update picture.');
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Error uploading picture.');
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

        setUser({
          id: data.userId || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: data.username || '',
          phone: data.phone || '',
          address: data.address || '',
          password: data.password || '',
          services: data.services || [],
        });

        setProfile({
          id: data.profileId || '',
          profilePicture: data.profilePicture ? `http://localhost:8080${data.profilePicture}` : '',
          bio: data.bio || '',
          mailId: data.mailId || '',
        });
      } else {
        toast.error('Failed to load profile.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  // Copy URL to clipboard function
  const copyProfileURL = () => {
      const url = `http://localhost:3000/priests/${user.id}`;
    navigator.clipboard.writeText(url)
      .then(() => toast.success('Profile URL copied to clipboard!'))
      .catch(() => toast.error('Failed to copy URL.'));
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="profile-container">
      <ToastContainer />
      <div className="profile-card">
        <div className="profile-image-wrapper">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Profile" className="profile-image" />
          ) : (
            <FaUser className="profile-image default-profile-icon" />
          )}
          <label htmlFor="fileInput" className="camera-icon-wrapper" title="Change Profile Picture">
            <FaCamera className="camera-icon" />
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            id="fileInput"
            style={{ display: 'none' }}
          />
        </div>

        <h2>{user.firstName} {user.lastName}</h2>

        <div className="profile-name-row">
          <div className="profile-section half-width">
            <label>First Name</label>
            <input
              type="text"
              value={user.firstName}
              onClick={() => openModal('firstName', user.firstName)}
              readOnly
              className="clickable-input"
            />
          </div>
          <div className="profile-section half-width">
            <label>Last Name</label>
            <input
              type="text"
              value={user.lastName}
              onClick={() => openModal('lastName', user.lastName)}
              readOnly
              className="clickable-input"
            />
          </div>
        </div>

        <div className="profile-section">
          <label>Username</label>
          <input
            type="text"
            value={user.username}
            readOnly
            className="readonly-input"
          />
        </div>

        <div className="profile-section">
          <label>Phone</label>
          <input
            type="text"
            value={user.phone}
            onClick={() => openModal('phone', user.phone)}
            readOnly
            className="clickable-input"
          />
        </div>

        <div className="profile-section">
          <label>Address</label>
          <input
            type="text"
            value={user.address}
            onClick={() => openModal('address', user.address)}
            readOnly
            className="clickable-input"
          />
        </div>

        <div className="profile-section">
          <label>Email ID</label>
          <input
            type="text"
            value={profile.mailId}
            onClick={() => openModal('mailId', profile.mailId)}
            readOnly
            className="clickable-input"
          />
        </div>

        <div className="profile-section">
          <label>Password</label>
          <input
            type="password"
            value={'********'}
            onClick={() => openModal('password', '')}
            readOnly
            className="clickable-input"
            title="Click to change password"
          />
        </div>

        {role === 'priest' && (
          <>
            <div className="profile-section">
              <label>Bio</label>
              <textarea
                value={profile.bio}
                onClick={() => openModal('bio', profile.bio)}
                readOnly
                className="clickable-textarea"
              />
            </div>

            <div className="profile-section profile-url-section">
              <label>URL</label>
              <div className="url-copy-wrapper">
                <input
                  type="text"
                  value={`http://localhost:3000/priests/${user.id}`}
                  readOnly
                  className="url-input"
                />
                <button onClick={copyProfileURL} className="copy-button" title="Copy URL">
                  <FaCopy />
                </button>
              </div>
            </div>

            <div className="profile-section">
              <label>Pooja Services</label>
              <ul
                className="services-list"
                onClick={() => openModal('services', user.services)}
                style={{ cursor: 'pointer' }}
                title="Click to edit services"
              >
                {user.services.length > 0 ? user.services.map((service, idx) => (
                  <li key={idx}>{service}</li>
                )) : <li>No services added</li>}
              </ul>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop" onClick={closeModal}>
          <div
            className="modal-content"
            onClick={e => e.stopPropagation()} // Prevent closing when clicking inside modal
          >
            <h3>Edit {currentField.charAt(0).toUpperCase() + currentField.slice(1)}</h3>
            {currentField === 'bio' ? (
              <textarea
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                rows={4}
              />
            ) : (
              <input
                type={currentField === 'password' ? 'password' : 'text'}
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                autoFocus
              />
            )}

            <div className="modal-actions">
              <button onClick={handleModalSave}>Save</button>
              <button onClick={closeModal}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
