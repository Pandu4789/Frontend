import React, { useEffect, useState, useCallback } from "react";
import axios from "axios";
import Cropper from "react-easy-crop";
import getCroppedImg from "./cropImage";
import {
  FaCamera,
  FaUser,
  FaIdCard,
  FaMapMarkerAlt,
  FaCheck,
  FaSpinner,
  FaTimes,
  FaScroll,
} from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Profile.css";

const API_URL = process.env.REACT_APP_API_BASE_URL;

const Profile = () => {
  const [profileData, setProfileData] = useState({
    id: "",
    firstName: "",
    lastName: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    zipCode: "",
    email: "",
    profilePicture: "",
    role: "",
    bio: "",
    services: "",
    languages: "",
  });

  const [originalProfileData, setOriginalProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");

  const [imageToCrop, setImageToCrop] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const userEmail = localStorage.getItem("userEmail");

  const fetchProfileData = useCallback(async () => {
    if (!userEmail || userEmail === "null") {
      toast.error("User session not found. Please log in.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `${API_URL}/api/auth/profile?email=${userEmail}`,
      );
      const data = res.data;

      // Map backend 'userId' to frontend state 'id' to fix the 'undefined' issue
      const actualId = data.userId || data.id;

      // Strip +1 for the display input
      const displayPhone = data.phone ? data.phone.replace("+1", "") : "";

      const formatted = {
        ...data,
        id: actualId,
        phone: displayPhone,
        // Convert Arrays from backend to comma-strings for React inputs
        services: Array.isArray(data.services)
          ? data.services.join(", ")
          : data.services || "",
        languages: Array.isArray(data.languages)
          ? data.languages.join(", ")
          : data.languages || "",
        profilePicture:
          data.profilePicture && !data.profilePicture.startsWith("http")
            ? `${API_URL}${data.profilePicture}`
            : data.profilePicture || "",
      };

      setProfileData(formatted);
      setOriginalProfileData(formatted);
    } catch (error) {
      toast.error("Failed to load profile.");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  // VALIDATIONS: Numeric Only
  const handlePhoneChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    if (val.length <= 10) setProfileData({ ...profileData, phone: val });
  };

  const handleZipChange = (e) => {
    const val = e.target.value.replace(/\D/g, "");
    setProfileData({ ...profileData, zipCode: val });
  };

  const isChanged = () =>
    JSON.stringify(profileData) !== JSON.stringify(originalProfileData);

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
      formData.append("profilePicture", croppedBlob, "profile.jpg");
      formData.append("userId", profileData.id);
      const res = await axios.post(
        `${API_URL}/api/auth/profile/updateProfilePicture`,
        formData,
      );
      setProfileData((prev) => ({
        ...prev,
        profilePicture: `${API_URL}${res.data.newPath}`,
      }));
      setImageToCrop(null);
      toast.success("Photo updated!");
    } catch (err) {
      toast.error("Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveChanges = async () => {
    if (profileData.phone.length !== 10) {
      toast.error("Phone number must be exactly 10 digits.");
      return;
    }

    setSaving(true);
    try {
      // Helper to convert comma-separated strings back to Arrays for Java List<String>
      const stringToArray = (val) => {
        if (!val) return [];
        if (Array.isArray(val)) return val;
        return val
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item !== "");
      };

      const updatePayload = {
        userId: profileData.id, // Fixed: This will no longer be undefined
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: `+1${profileData.phone}`,
        addressLine1: profileData.addressLine1,
        addressLine2: profileData.addressLine2,
        city: profileData.city,
        state: profileData.state,
        zipCode: profileData.zipCode,
        bio: profileData.bio,
        services: stringToArray(profileData.services),
        languages: stringToArray(profileData.languages),
      };

      console.log("Sending Payload:", updatePayload);

      await axios.post(`${API_URL}/api/auth/profile/update`, updatePayload);
      setOriginalProfileData(profileData);
      localStorage.setItem("userEmail", profileData.email);
      toast.success("Profile saved!");
    } catch (err) {
      const errorMsg = err.response?.data || "Save failed.";
      console.error("Update error:", errorMsg);
      toast.error(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-loader">Connecting to Priestify...</div>;

  return (
    <div className="p-page-wrapper">
      <ToastContainer position="bottom-right" theme="colored" />

      {imageToCrop && (
        <div className="p-crop-modal">
          <div className="p-crop-container">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={(u, p) => setCroppedAreaPixels(p)}
            />
          </div>
          <div className="p-crop-controls">
            <div className="p-crop-btns">
              <button
                onClick={() => setImageToCrop(null)}
                className="p-btn-cancel-crop"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadCroppedImage}
                className="p-btn-save-crop"
              >
                Set Photo
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="p-card-container">
        <aside className="p-sidebar">
          <div className="p-profile-preview">
            <div className="p-avatar-container">
              <div className="p-avatar-circle">
                {profileData.profilePicture ? (
                  <img src={profileData.profilePicture} alt="User" />
                ) : (
                  <FaUser className="p-icon-placeholder" />
                )}
              </div>
              <label htmlFor="p-upload" className="p-camera-overlay">
                <FaCamera />
              </label>
              <input
                type="file"
                id="p-upload"
                hidden
                onChange={onFileChange}
                accept="image/*"
              />
            </div>
            <h3>
              {profileData.firstName} {profileData.lastName}
            </h3>
            <span className="p-role-label">
              {profileData.role || "CUSTOMER"}
            </span>
          </div>

          <nav className="p-nav">
            <button
              className={activeTab === "personal" ? "active" : ""}
              onClick={() => setActiveTab("personal")}
            >
              <FaIdCard /> Personal Info
            </button>
            <button
              className={activeTab === "address" ? "active" : ""}
              onClick={() => setActiveTab("address")}
            >
              <FaMapMarkerAlt /> Address Details
            </button>
            {profileData.role?.toLowerCase() === "priest" && (
              <button
                className={activeTab === "other" ? "active" : ""}
                onClick={() => setActiveTab("other")}
              >
                <FaScroll /> Other Details
              </button>
            )}
          </nav>
        </aside>

        <main className="p-content">
          <header className="p-header">
            <h2>
              {activeTab === "personal"
                ? "Personal Details"
                : activeTab === "address"
                  ? "Address Details"
                  : "Other Details"}
            </h2>
          </header>

          <div className="p-form-area">
            {activeTab === "personal" && (
              <div className="p-grid fade-in">
                <div className="p-input-group">
                  <label>First Name</label>
                  <input
                    value={profileData.firstName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        firstName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-input-group">
                  <label>Last Name</label>
                  <input
                    value={profileData.lastName}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        lastName: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-input-group full-row">
                  <label>Email Address</label>
                  <input
                    value={profileData.email}
                    onChange={(e) =>
                      setProfileData({ ...profileData, email: e.target.value })
                    }
                  />
                </div>
                <div className="p-input-group full-row">
                  <label>Phone Number</label>
                  <div className="p-phone-input-wrapper">
                    <span className="p-phone-prefix">+1</span>
                    <input
                      type="text"
                      value={profileData.phone}
                      onChange={handlePhoneChange}
                      placeholder="10 Digits"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === "address" && (
              <div className="p-grid fade-in">
                <div className="p-input-group full-row">
                  <label>Street Address</label>
                  <input
                    value={profileData.addressLine1}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        addressLine1: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-input-group full-row">
                  <label>Suite / Apartment</label>
                  <input
                    value={profileData.addressLine2}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        addressLine2: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-input-group">
                  <label>City</label>
                  <input
                    value={profileData.city}
                    onChange={(e) =>
                      setProfileData({ ...profileData, city: e.target.value })
                    }
                  />
                </div>
                <div className="p-input-group">
                  <label>State</label>
                  <input
                    value={profileData.state}
                    onChange={(e) =>
                      setProfileData({ ...profileData, state: e.target.value })
                    }
                  />
                </div>
                <div className="p-input-group full-row">
                  <label>Zip Code</label>
                  <input
                    type="text"
                    value={profileData.zipCode}
                    onChange={handleZipChange}
                  />
                </div>
              </div>
            )}

            {activeTab === "other" && (
              <div className="p-grid fade-in">
                <div className="p-input-group full-row">
                  <label>Bio</label>
                  <textarea
                    value={profileData.bio}
                    onChange={(e) =>
                      setProfileData({ ...profileData, bio: e.target.value })
                    }
                    className="p-textarea"
                    rows="3"
                  />
                </div>
                <div className="p-input-group">
                  <label>Services (comma separated)</label>
                  <input
                    value={profileData.services}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        services: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="p-input-group">
                  <label>Languages (comma separated)</label>
                  <input
                    value={profileData.languages}
                    onChange={(e) =>
                      setProfileData({
                        ...profileData,
                        languages: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            )}
          </div>

          <footer className="p-footer">
            <button
              className="p-btn-discard"
              disabled={!isChanged() || saving}
              onClick={() => setProfileData(originalProfileData)}
            >
              <FaTimes /> Discard
            </button>
            <button
              className={`p-btn-save ${!isChanged() ? "disabled" : ""}`}
              disabled={!isChanged() || saving}
              onClick={handleSaveChanges}
            >
              {saving ? (
                <FaSpinner className="p-spin" />
              ) : (
                <>
                  <FaCheck /> Save Changes
                </>
              )}
            </button>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Profile;
