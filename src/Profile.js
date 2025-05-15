import React, { useEffect, useState } from 'react';
import './Profile.css';
import { FaCamera, FaUser } from 'react-icons/fa';
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
    setCurrentValue(field === 'services' ? value.join(', ') : value);
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
    } else if (currentField in user) {
      updatedUser[currentField] = currentValue;
    } else {
      updatedProfile[currentField] = currentValue;
    }

    setUser(updatedUser);
    setProfile(updatedProfile);
    closeModal();

    try {
      const userRes = await fetch('http://localhost:8080/api/auth/updateUser', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (!userRes.ok) throw new Error('User update failed');

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
    if (!username) return setLoading(false);

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
      toast.error('Failed to load profile.');
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
      <ToastContainer />
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
            style={{ display: 'none' }}
          />
        </div>

        <h2>{user.firstName} {user.lastName}</h2>

        <div className="profile-name-row">
          <div className="profile-section half-width">
            <label>First Name</label>
            <textarea value={user.firstName} onClick={() => openModal('firstName', user.firstName)} readOnly />
          </div>
          <div className="profile-section half-width">
            <label>Last Name</label>
            <textarea value={user.lastName} onClick={() => openModal('lastName', user.lastName)} readOnly />
          </div>
        </div>

        <div className="profile-section"><label>Username</label>
          <textarea value={user.username} readOnly />
        </div>

        <div className="profile-section"><label>Phone</label>
          <textarea value={user.phone} onClick={() => openModal('phone', user.phone)} readOnly />
        </div>

        <div className="profile-section"><label>Address</label>
          <textarea value={user.address} onClick={() => openModal('address', user.address)} readOnly />
        </div>

        <div className="profile-section"><label>Email ID</label>
          <textarea value={profile.mailId} onClick={() => openModal('mailId', profile.mailId)} readOnly />
        </div>

        <div className="profile-section"><label>Password</label>
          <textarea value={user.password} onClick={() => openModal('password', user.password)} readOnly />
        </div>

        {role === 'priest' && (
          <>
            <div className="profile-section"><label>Bio</label>
              <textarea value={profile.bio} onClick={() => openModal('bio', profile.bio)} readOnly />
            </div>

            <div className="profile-section">
              <label>Pooja Services</label>
              <ul className="services-list" onClick={() => openModal('services', user.services)} style={{ cursor: 'pointer' }}>
                {user.services.map((service, idx) => <li key={idx}>{service}</li>)}
              </ul>
            </div>
          </>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <h3>Edit {currentField}</h3>
            <input type="text" value={currentValue} onChange={(e) => setCurrentValue(e.target.value)} />
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
