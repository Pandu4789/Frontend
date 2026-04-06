import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineMailOutline, MdOutlinePhone, MdOutlineLock } from 'react-icons/md';
import { FaRegUser } from "react-icons/fa"; 
import { BsHouseDoor } from "react-icons/bs"; 
import './signup.css'; // Importing the new CSS file

const SignUp = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    role: 'customer',
    bio: '',
    selectedServices: [],
    selectedLanguages: [],
    offersHoroscopeReading: false,
  });

  const [availableServices, setAvailableServices] = useState([]);
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
  ];

  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePassword = (value) => {
    if (!value) return 'Password is required';
    if (value.length < 8) return 'Must be at least 8 characters';
    if (!/[A-Z]/.test(value)) return 'Requires an uppercase letter';
    if (!/[a-z]/.test(value)) return 'Requires a lowercase letter';
    if (!/[0-9]/.test(value)) return 'Requires a number';
    if (!/[^A-Za-z0-9]/.test(value)) return 'Requires a special character';
    return '';
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    if (name === 'password') {
      setPasswordError(validatePassword(value));
      if (form.confirmPassword && value !== form.confirmPassword) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    } else if (name === 'confirmPassword') {
      if (form.password && value !== form.password) {
        setConfirmPasswordError('Passwords do not match');
      } else {
        setConfirmPasswordError('');
      }
    }
  };

  useEffect(() => {
    const fetchServices = async () => {
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
        console.error("Error loading services:", err);
        setError("Failed to load services. Please try again later.");
      }
    };

    if (form.role === "priest") {
      fetchServices();
    }
  }, [API_URL, form.role]);

  const handleServicesChange = (selectedOptions) => {
    setForm((prevForm) => ({
      ...prevForm,
      selectedServices: selectedOptions || [],
    }));
  };
  
  const handleLanguagesChange = (selectedOptions) => {
    setForm((prevForm) => ({
      ...prevForm,
      selectedLanguages: selectedOptions || [],
    }));
  };

  const handleRoleChange = (selectedRole) => {
    setForm((prevForm) => ({
      ...prevForm,
      role: selectedRole,
      ...(selectedRole === 'customer' && {
        bio: '',
        selectedServices: [],
        selectedLanguages: [],
        offersHoroscopeReading: false,
      }),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPasswordError('');
    setConfirmPasswordError('');

    const validationError = validatePassword(form.password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (form.password !== form.confirmPassword) {
      setConfirmPasswordError('Passwords do not match');
      return;
    }

    if (!form.role) {
      setError('Please select a role (Customer or Priest).');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        addressLine1: form.addressLine1,
        addressLine2: form.addressLine2,
        city: form.city,
        state: form.state,
        zipCode: form.zipCode,
        role: form.role,
      };

      if (form.role === 'priest') {
        payload.bio = form.bio;
        payload.servicesOffered = form.selectedServices.map(service => service.value);
        payload.languagesSpoken = form.selectedLanguages.map(lang => lang.value);
        payload.offersHoroscopeReading = form.offersHoroscopeReading;
      }

      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Signup failed');
      }

      alert('Signup successful!');
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Custom styles for React-Select to match the Priestify theme
  const customSelectStyles = {
    control: (base, state) => ({
      ...base,
      border: state.isFocused ? '1px solid #E65C00' : '1px solid #E0E0E0',
      borderRadius: '10px',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(230, 92, 0, 0.1)' : 'none',
      '&:hover': {
        borderColor: '#E65C00',
      },
      minHeight: '52px',
      backgroundColor: '#F8F9FA',
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: 'rgba(230, 92, 0, 0.15)',
      borderRadius: '5px',
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: '#BF360C',
      fontWeight: '600',
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: '#BF360C',
      '&:hover': {
        backgroundColor: '#E65C00',
        color: '#FFF',
      },
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? 'rgba(230, 92, 0, 0.1)' : null,
      color: state.isSelected ? '#E65C00' : '#333',
      cursor: 'pointer',
    }),
  };

  return (
    <div className="signup-page-container">
      <div className="signup-card">
        
        {/* BRAND HEADER */}
        <div className="signup-header">
            <h1 className="signup-brand-text">
              <span className="brand-priest-dark">PRIEST</span>
              <span className="brand-ify">IFY</span>
            </h1>
            <p className="signup-subtitle">Create your account to get started</p>
        </div>

        {/* ROLE SELECTION */}
        <div className="signup-role-section">
          <div className="signup-role-toggle">
            <button
              type="button"
              className={`signup-role-btn ${form.role === 'customer' ? 'active' : ''}`}
              onClick={() => handleRoleChange('customer')}
            >
              <FaRegUser /> Customer
            </button>
            <button
              type="button"
              className={`signup-role-btn ${form.role === 'priest' ? 'active' : ''}`}
              onClick={() => handleRoleChange('priest')}
            >
              <FaRegUser /> Priest
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL INFORMATION SECTION */}
          <div className="signup-section">
            <h3 className="signup-section-heading">
              <FaRegUser className="heading-icon" /> Personal Information
            </h3>
            <div className="signup-form-grid">
              
              <div className="signup-input-container">
                <label className="signup-input-label">First Name</label>
                <div className="signup-input-group">
                  <input
                    name="firstName"
                    type="text"
                    placeholder="e.g. Ramesh"
                    value={form.firstName}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">Last Name</label>
                <div className="signup-input-group">
                  <input
                    name="lastName"
                    type="text"
                    placeholder="e.g. Sharma"
                    value={form.lastName}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">Email ID</label>
                <div className="signup-input-group">
                  <MdOutlineMailOutline className="signup-input-icon" />
                  <input
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">Phone Number</label>
                <div className="signup-input-group">
                  <MdOutlinePhone className="signup-input-icon" />
                  <input
                    name="phone"
                    type="text"
                    placeholder="9876543210"
                    value={form.phone}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      if (onlyNums.length <= 12) {
                        handleChange({ target: { name: 'phone', value: onlyNums } });
                      }
                    }}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">Password</label>
                <div className="signup-input-group">
                  <MdOutlineLock className="signup-input-icon" />
                  <input
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={form.password}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    className="signup-password-toggle"
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {passwordError && <p className="signup-error-text">{passwordError}</p>}
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">Confirm Password</label>
                <div className="signup-input-group">
                  <MdOutlineLock className="signup-input-icon" />
                  <input
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="signup-password-toggle"
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {confirmPasswordError && <p className="signup-error-text">{confirmPasswordError}</p>}
              </div>
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div className="signup-section">
            <h3 className="signup-section-heading">
              <BsHouseDoor className="heading-icon" /> Address
            </h3>
            <div className="signup-form-grid">
              
              <div className="signup-input-container full-width">
                <label className="signup-input-label">Address Line 1</label>
                <div className="signup-input-group">
                  <input
                    name="addressLine1"
                    type="text"
                    placeholder="House No, Street Name"
                    value={form.addressLine1}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container full-width">
                <label className="signup-input-label">Address Line 2 (Optional)</label>
                <div className="signup-input-group">
                  <input
                    name="addressLine2"
                    type="text"
                    placeholder="Apartment, Suite, Landmark"
                    value={form.addressLine2}
                    onChange={handleChange}
                    className="signup-auth-input"
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">City</label>
                <div className="signup-input-group">
                  <input
                    name="city"
                    type="text"
                    placeholder="e.g. Irving"
                    value={form.city}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">State</label>
                <div className="signup-input-group">
                  <input
                    name="state"
                    type="text"
                    placeholder="e.g. Texas"
                    value={form.state}
                    onChange={handleChange}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>

              <div className="signup-input-container">
                <label className="signup-input-label">ZIP Code</label>
                <div className="signup-input-group">
                  <input
                    name="zipCode"
                    type="text"
                    placeholder="e.g. 75062"
                    value={form.zipCode}
                    onChange={(e) => {
                      const onlyNums = e.target.value.replace(/\D/g, '');
                      if (onlyNums.length <= 7) {
                        handleChange({ target: { name: 'zipCode', value: onlyNums } });
                      }
                    }}
                    className="signup-auth-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PRIEST DETAILS SECTION (CONDITIONAL) */}
          {form.role === 'priest' && (
            <div className="signup-section">
              <h3 className="signup-section-heading">Priest Details</h3>
              <div className="signup-form-grid">
                
                <div className="signup-input-container full-width">
                  <label className="signup-input-label">About You</label>
                  <textarea
                    name="bio"
                    placeholder="Tell us about your experience and background..."
                    value={form.bio}
                    onChange={handleChange}
                    className="signup-auth-textarea"
                    rows="4"
                    required
                  ></textarea>
                </div>

                <div className="signup-input-container full-width">
                  <label className="signup-input-label">Services Offered</label>
                  <Select
                    isMulti
                    name="servicesOffered"
                    options={availableServices}
                    value={form.selectedServices}
                    onChange={handleServicesChange}
                    placeholder="Select Services You Offer"
                    styles={customSelectStyles}
                    required={form.role === 'priest' && form.selectedServices.length === 0}
                  />
                  <small className="signup-small-text">
                    Please select all the spiritual services you provide.
                  </small>
                </div>
                
                <div className="signup-input-container full-width">
                  <label className="signup-input-label">Languages Spoken</label>
                  <Select
                    isMulti
                    name="languagesSpoken"
                    options={availableLanguages}
                    value={form.selectedLanguages}
                    onChange={handleLanguagesChange}
                    placeholder="Select Languages You Speak"
                    styles={customSelectStyles}
                    required={form.role === 'priest' && form.selectedLanguages.length === 0}
                  />
                  <small className="signup-small-text">
                    Please select all the languages you can communicate in.
                  </small>
                </div>

                <div className="signup-input-container full-width">
                  <p className="signup-input-label">Do you offer Jatakam (Horoscope Reading)?</p>
                  <div className="signup-radio-group">
                    <label className="signup-radio-label">
                      <input
                        type="radio"
                        name="offersHoroscopeReading"
                        value="yes"
                        checked={form.offersHoroscopeReading === true}
                        onChange={() => setForm({ ...form, offersHoroscopeReading: true })}
                        className="signup-radio-input"
                      />{' '}
                      Yes
                    </label>
                    <label className="signup-radio-label">
                      <input
                        type="radio"
                        name="offersHoroscopeReading"
                        value="no"
                        checked={form.offersHoroscopeReading === false}
                        onChange={() => setForm({ ...form, offersHoroscopeReading: false })}
                        className="signup-radio-input"
                      />{' '}
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <div className="signup-main-error">{error}</div>}

          <button type="submit" className="signup-auth-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Create Account'}
          </button>
        </form>

        <p className="signup-switch-link">
          Already have an account?{' '}
          <a onClick={() => navigate('/login')} className="signup-link">
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;