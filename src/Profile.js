import React, { useEffect, useState } from 'react';
import './Profile.css';
import { FaCamera, FaUser, FaCopy } from 'react-icons/fa';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Select from 'react-select'; // Import react-select

const Profile = () => {
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  // State to hold profile data (editable copy)
  // services and languages will now store array of { value: string, label: string } objects for react-select
  const [profileData, setProfileData] = useState({
    profileId: '',
    userId: '',
    firstName: '',
    lastName: '',
    username: '',
    phone: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    email: '',
    profilePicture: '',
    bio: '',
    services: [], // Will store [{ value: 'Pooja Name', label: 'Pooja Name' }]
    languages: [], // Will store [{ value: 'English', label: 'English' }]
    role: '',
  });

  // This will keep the original profile data fetched from server to revert changes if needed
  const [originalProfileData, setOriginalProfileData] = useState(null); // Also stores {value, label} objects

  const [loading, setLoading] = useState(true);
  const [availableServices, setAvailableServices] = useState([]); // Options for the services dropdown

  // Hardcoded list of languages (same as SignUp)
  const availableLanguages = [
    { value: 'English', label: 'English' },
    { value: 'Hindi', label: 'Hindi' },
    { value: 'Tamil', label: 'Tamil' },
    { value: 'Telugu', label: 'Telugu' },
    { value: 'Kannada', label: 'Kannada' },
    { value: 'Malayalam', label: 'Malayalam' },
    { value: 'Gujarati', label: 'Gujarati' },
    { value: 'Bengali', label: 'Bengali' },
    { value: 'Marathi', label: 'Marathi' },
    { value: 'Punjabi', label: 'Punjabi' },
    { value: 'Sanskrit', label: 'Sanskrit' },
    // Add more languages as needed
  ];


  const userEmail = localStorage.getItem('userEmail');
  const userRole = localStorage.getItem('role');

  // Fetch available services (similar to SignUp)
  useEffect(() => {
    const fetchEventServices = async () => {
      try {
        const res = await fetch(`${API_URL}/api/events`);
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        const data = await res.json();
        setAvailableServices(
          data.map((service) => ({
            label: service.name,
            value: service.name,
          }))
        );
      } catch (err) {
        console.error("Error loading available services:", err);
        // Optionally, show a toast error for services loading
      }
    };
    fetchEventServices();
  }, [API_URL]);


  const fetchProfileData = async () => {
    if (!userEmail) {
      setLoading(false);
      toast.error('User email not found in local storage. Please log in.');
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/profile?email=${userEmail}`);
      if (res.ok) {
        const data = await res.json();
        console.log('Fetched profile data:', data); // Log the raw data to inspect structure
        const formattedData = {
          profileId: data.profileId || '',
          userId: data.userId || '',
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          username: userEmail,
          phone: data.phone || '',
          addressLine1: data.addressLine1 || '',
          addressLine2: data.addressLine2 || '',
          city: data.city || '',
          state: data.state || '',
          zipCode: data.zipCode || '',
          email: data.email || '',
          profilePicture: data.profilePicture ? `http://localhost:8080${data.profilePicture}` : '',
          bio: data.bio || '',
          // Convert incoming string arrays to {value, label} objects for react-select
          services: (data.services || []).map(s => ({ value: s, label: s })),
          languages: (data.languages || []).map(l => ({ value: l, label: l })),
          role: data.role || '',
        };
        setProfileData(formattedData);
        setOriginalProfileData(formattedData); // Save original in the same format
      } else {
        const errorText = await res.text();
        console.error(`Failed to load profile: ${res.status} - ${errorText}`);
        toast.error('Failed to load profile. Please check console for details.');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile. Network error or server issue.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, [userEmail]); // Dependency on userEmail to refetch if it changes

  // Detect if any field was changed compared to original data
  const isChanged = () => {
    if (!originalProfileData) return false; // Cannot compare if original is not loaded

    // Helper to compare two arrays of {value, label} objects by their values
    const areArraysOfObjectsChanged = (arr1, arr2) => {
        const values1 = (arr1 || []).map(item => item.value).sort();
        const values2 = (arr2 || []).map(item => item.value).sort();
        return JSON.stringify(values1) !== JSON.stringify(values2);
    };

    // Compare specific fields
    if (profileData.firstName !== originalProfileData.firstName) return true;
    if (profileData.lastName !== originalProfileData.lastName) return true;
    if (profileData.phone !== originalProfileData.phone) return true;
    if (profileData.addressLine1 !== originalProfileData.addressLine1) return true;
    if (profileData.addressLine2 !== originalProfileData.addressLine2) return true;
    if (profileData.city !== originalProfileData.city) return true;
    if (profileData.state !== originalProfileData.state) return true;
    if (profileData.zipCode !== originalProfileData.zipCode) return true;
    if (profileData.bio !== originalProfileData.bio) return true;
    // profilePicture is handled by its own upload, but we can compare its URL
    if (profileData.profilePicture !== originalProfileData.profilePicture) return true;

    // Compare services and languages using the helper
    if (areArraysOfObjectsChanged(profileData.services, originalProfileData.services)) return true;
    if (areArraysOfObjectsChanged(profileData.languages, originalProfileData.languages)) return true;

    return false;
  };

  // Save all changes at once
  const handleSaveChanges = async () => {
    try {
      const updatePayload = {
        userId: profileData.userId,
        profileId: profileData.profileId,
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        addressLine1: profileData.addressLine1,
        addressLine2: profileData.addressLine2,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        mailId: profileData.email,  // note API expects mailId
        bio: profileData.bio,
        // Convert services and languages back to string arrays for the backend
        services: (profileData.services || []).map(s => s.value),
        languages: (profileData.languages || []).map(l => l.value),
      };

      const res = await fetch(`${API_URL}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Update failed: ${res.status} - ${errorText}`);
      }

      toast.success('Profile updated successfully!');
      // Update originalProfileData with the current profileData (which is already in {value, label} format)
      setOriginalProfileData(profileData);
    } catch (err) {
      console.error('Update error:', err);
      toast.error('Failed to update profile: ' + err.message);
    }
  };

  // Cancel edits and revert to original
  const handleCancelChanges = () => {
    setProfileData(originalProfileData);
  };

  const copyProfileURL = () => {
    if (profileData.userId) {
      const url = `http://localhost:3000/priests/${profileData.userId}`;
      navigator.clipboard.writeText(url)
        .then(() => toast.success('Profile URL copied to clipboard!'))
        .catch(() => toast.error('Failed to copy URL.'));
    } else {
      toast.error('User ID not available to generate URL.');
    }
  };

  // Handler for profile picture change
  const handleImageChange = async (e) => {
    const file = e.target.files ? e.target.files.length > 0 ? e.target.files.item(0) : null : null;
    if (!file) return;

    // Show selected image immediately using object URL
    const imageUrl = URL.createObjectURL(file);
    setProfileData(prev => ({ ...prev, profilePicture: imageUrl }));

    // Prepare form data for upload
    const formData = new FormData();
    formData.append('profilePicture', file);
    formData.append('profileId', profileData.profileId);

    try {
      const res = await fetch(`${API_URL}/api/profile/updateProfilePicture`, {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        toast.success('Profile picture updated!');
        // Update profile picture URL with server response path
        const newPicturePath = `http://localhost:8080${data.newPath}`;
        setProfileData(prev => ({ ...prev, profilePicture: newPicturePath }));
        setOriginalProfileData(prev => ({ ...prev, profilePicture: newPicturePath })); // Update original as well
      } else {
        toast.error('Failed to update picture.');
        // Revert to the previously saved picture URL if available, otherwise clear it
        setProfileData(prev => ({
          ...prev,
          profilePicture: originalProfileData ? originalProfileData.profilePicture : '',
        }));
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Error uploading picture.');
      // Revert on error as well
      setProfileData(prev => ({
        ...prev,
        profilePicture: originalProfileData ? originalProfileData.profilePicture : '',
      }));
    }
  };

  if (loading) return <div className="loading-container">Loading profile...</div>;

  // Helper to handle input changes for text/textarea
  const handleInputChange = (field, value) => {
    // This is for regular text inputs, not for react-select
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  // Handlers for react-select components
  const handleServicesChange = (selectedOptions) => {
    setProfileData(prev => ({
      ...prev,
      services: selectedOptions || [],
    }));
  };

  const handleLanguagesChange = (selectedOptions) => {
    setProfileData(prev => ({
      ...prev,
      languages: selectedOptions || [],
    }));
  };


  // Styles for react-select components - copied from SignUp for consistency
  const reactSelectStyles = {
    control: (base, state) => ({
      ...base,
      border: `1px solid ${state.isFocused ? '#B74F2F' : '#DDD'}`,
      borderRadius: '8px', // Match overall profile card border-radius
      boxShadow: state.isFocused ? '0 0 0 1px #B74F2F' : 'none',
      '&:hover': {
        borderColor: '#B74F2F',
      },
      minHeight: '52px', // Consistent height
      boxSizing: 'border-box',
      padding: '0 5px', // Add some internal padding
      backgroundColor: '#FFF', // Ensure white background
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: '#FFECB3', // Light orange/saffron tint
      borderRadius: '3px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#555',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#999',
      '&:hover': {
        backgroundColor: '#FFD54F',
        color: '#333',
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#FFF3E0' : null, // Lighter hover
      color: '#333',
      '&:active': {
        backgroundColor: '#FFECB3', // Active selection background
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: '#999', // Lighter placeholder text
    }),
  };


  return (
    <div className="profile-container">
      <ToastContainer />
      <div className="profile-card">
        <div className="profile-image-wrapper">
          {profileData.profilePicture ? (
            <img src={profileData.profilePicture} alt="Profile" className="profile-image" />
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

        <h2>{profileData.firstName} {profileData.lastName}</h2>

        {/* Editable fields with labels and inputs below */}
        <div className="profile-row">
          <div className="profile-section">
            <label className="field-label">First Name</label>
            <input
              type="text"
              value={profileData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
            />
          </div>
          <div className="profile-section">
            <label className="field-label">Last Name</label>
            <input
              type="text"
              value={profileData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
            />
          </div>
        </div>

        <div className="profile-section">
          <label className="field-label">Email (read-only)</label>
          <input type="email" value={profileData.username} readOnly />
        </div>

        <div className="profile-section">
          <label className="field-label">Phone</label>
          <input
            type="tel"
            value={profileData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
        </div>

        <div className="profile-section">
          <label className="field-label">Address Line 1</label>
          <input
            type="text"
            value={profileData.addressLine1}
            onChange={(e) => handleInputChange('addressLine1', e.target.value)}
          />
        </div>

        <div className="profile-section">
          <label className="field-label">Address Line 2</label>
          <input
            type="text"
            value={profileData.addressLine2}
            onChange={(e) => handleInputChange('addressLine2', e.target.value)}
          />
        </div>

        <div className="profile-row">
          <div className="profile-section">
            <label className="field-label">City</label>
            <input
              type="text"
              value={profileData.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
            />
          </div>
          <div className="profile-section">
            <label className="field-label">State</label>
            <input
              type="text"
              value={profileData.state}
              onChange={(e) => handleInputChange('state', e.target.value)}
            />
          </div>
        </div>

        <div className="profile-section">
          <label className="field-label">Zip Code</label>
          <input
            type="text"
            value={profileData.zipCode}
            onChange={(e) => handleInputChange('zipCode', e.target.value)}
          />
        </div>

        {profileData.role === 'priest' && (
          <>
            <div className="profile-section">
              <label className="field-label">Bio</label>
              <textarea
                rows={4}
                value={profileData.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
              />
            </div>

            <div className="profile-section profile-url-section">
              <label className="field-label">Profile URL</label>
              <div className="url-copy-wrapper">
                <input
                  type="text"
                  value={`http://localhost:3000/priests/${profileData.userId}`}
                  readOnly
                  className="read-only-input url-input"
                />
                <button onClick={copyProfileURL} className="copy-button" title="Copy URL">
                  <FaCopy />
                </button>
              </div>
            </div>

            {/* Services Multi-Select */}
            <div className="profile-section">
              <label className="field-label">Pooja Services</label>
              <Select
                isMulti
                name="services"
                options={availableServices} // Use the fetched available services
                value={profileData.services} // Expects array of {value, label} objects
                onChange={handleServicesChange}
                placeholder="Select Services You Offer"
                styles={reactSelectStyles}
              />
            </div>

            {/* Languages Multi-Select */}
            <div className="profile-section">
              <label className="field-label">Languages</label>
              <Select
                isMulti
                name="languages"
                options={availableLanguages} // Use the hardcoded available languages
                value={profileData.languages} // Expects array of {value, label} objects
                onChange={handleLanguagesChange}
                placeholder="Select Languages You Speak"
                styles={reactSelectStyles}
              />
            </div>
          </>
        )}

        {/* Buttons fixed below the form */}
        <div className="profile-actions">
          <button
            onClick={handleSaveChanges}
            disabled={!isChanged()}
            className={isChanged() ? 'save-btn' : 'save-btn disabled'}
          >
            Save Changes
          </button>
          <button onClick={handleCancelChanges} className="cancel-btn" disabled={!isChanged()}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;