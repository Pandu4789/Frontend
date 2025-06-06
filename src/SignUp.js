import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { MdOutlineMailOutline, MdOutlinePhone, MdOutlineLock } from 'react-icons/md';
import { FaRegUser } from "react-icons/fa"; // Using FaRegUser for both Customer and Priest
import { BsHouseDoor } from "react-icons/bs"; // Keeping import, but BsHouseDoor is not used for Priest role button anymore

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
    offersHoroscopeReading: false,
  });

  const [availableServices, setAvailableServices] = useState([]);
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
            value: service.id,
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

  const handleRoleChange = (selectedRole) => {
    setForm((prevForm) => ({
      ...prevForm,
      role: selectedRole,
      ...(selectedRole === 'customer' && {
        bio: '',
        selectedServices: [],
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

  const styles = {
    authContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh', // Ensure full viewport height
      backgroundColor: '#FEF3E4', // Hindu priest theme background
      padding: '20px', // Padding around the card
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif',
      color: '#333',
      boxSizing: 'border-box', // Include padding in element's total width and height
      overflowY: 'auto', // Allow scrolling if content is too tall
    },
    authCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
      padding: '30px 40px',
      width: '100%',
      maxWidth: '800px', // Maximum width for the card
      display: 'flex',
      flexDirection: 'column',
      gap: '30px', // Space between major sections
      boxSizing: 'border-box',
    },
    sectionHeading: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#B74F2F', // Deeper reddish-brown for section titles
      marginBottom: '20px',
      borderBottom: '1px solid #F0E0D0', // Lighter, themed border
      paddingBottom: '10px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    },
    roleSelection: {
      display: 'flex',
      gap: '15px',
      marginBottom: '20px',
      marginTop: '10px',
    },
    roleButton: {
      flex: 'none', // Make buttons share equal width
      padding: '10px 20px', // Previous padding for button size
      borderRadius: '25px',
      border: '1px solid #FFB300', // Golden border for buttons
      backgroundColor: 'transparent', // Transparent background for inactive
      color: '#FF8F00', // Orange-gold text for inactive
      fontSize: '16px',
      fontWeight: '500',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center', // Center icon and text
      gap: '8px',
      boxSizing: 'border-box',
      width: '150px',
    },
    roleButtonActive: {
      backgroundColor: '#FF8F00', // Saffron/Orange for active
      color: 'white',
      borderColor: '#FF8F00',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '20px 30px',
    },
    formRow: {
      gridColumn: '1 / span 2',
    },
    inputContainer: {
      display: 'flex',
      flexDirection: 'column',
      gap: '4px', // Reduced gap between label and input
    },
    inputLabel: {
      fontSize: '14px',
      fontWeight: '500',
      color: '#555',
    },
    inputGroup: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      border: '1px solid #DDD',
      borderRadius: '5px',
      backgroundColor: '#FFF',
      minHeight: '52px', // Consistent height for inputs
      boxSizing: 'border-box',
    },
    inputIcon: {
      color: '#999',
      marginLeft: '15px',
      marginRight: '10px',
      fontSize: '20px',
      flexShrink: 0,
    },
    authInput: {
      flexGrow: 1,
      border: 'none',
      outline: 'none',
      fontSize: '16px',
      color: '#333',
      padding: '12px 15px', // Consistent padding for all inputs
      boxSizing: 'border-box',
    },
    authTextarea: {
      width: '100%',
      padding: '15px',
      borderRadius: '5px',
      border: '1px solid #DDD',
      fontSize: '16px',
      minHeight: '150px',
      resize: 'vertical',
      backgroundColor: '#FFFFFF',
      color: '#333',
      outline: 'none',
      boxSizing: 'border-box',
    },
    passwordToggle: {
      cursor: 'pointer',
      color: '#999',
      fontSize: '18px',
      position: 'absolute',
      right: '15px',
      top: '50%',
      transform: 'translateY(-50%)',
      flexShrink: 0,
    },
    errorText: {
      color: '#D32F2F',
      fontSize: '13px',
      marginTop: '5px',
      marginLeft: '5px',
    },
    smallText: {
      color: '#777',
      fontSize: '13px',
      marginTop: '5px',
      display: 'block',
      marginLeft: '5px',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '16px',
      color: '#333',
      cursor: 'pointer',
      marginTop: '10px',
    },
    checkboxInput: {
      marginRight: '10px',
      transform: 'scale(1.2)',
      accentColor: '#B74F2F',
      cursor: 'pointer',
    },
    radioGroup: {
      display: 'flex',
      gap: '20px',
    },
    authBtn: {
      backgroundColor: '#BF360C', // Register button color
      color: 'white',
      border: 'none',
      padding: '15px 25px',
      borderRadius: '5px',
      fontSize: '18px',
      fontWeight: '600',
      cursor: 'pointer',
      marginTop: '20px',
      width: '100%',
      opacity: isSubmitting ? 0.7 : 1,
      pointerEvents: isSubmitting ? 'none' : 'auto',
      transition: 'background-color 0.2s ease',
      boxSizing: 'border-box',
    },
    switchLink: {
      textAlign: 'center',
      marginTop: '25px',
      color: '#555',
      fontSize: '15px',
    },
    link: {
      color: '#BF360C', // Link color matches register button
      cursor: 'pointer',
      textDecoration: 'none',
      fontWeight: 'bold',
    },
    reactSelect: {
      control: (base) => ({
        ...base,
        border: '1px solid #DDD',
        borderRadius: '5px',
        boxShadow: 'none',
        '&:hover': {
          borderColor: '#B74F2F',
        },
        minHeight: '52px',
        boxSizing: 'border-box',
      }),
      multiValue: (base) => ({
        ...base,
        backgroundColor: '#FFECB3',
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
        backgroundColor: state.isFocused ? '#FFF3E0' : null,
        color: '#333',
      }),
    },
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>

        {/* ROLE SELECTION */}
        <div>
          <h3 style={styles.sectionHeading}>
            <FaRegUser /> Select Your Role
          </h3>
          <div style={styles.roleSelection}>
            <button
              type="button"
              style={{
                ...styles.roleButton,
                ...(form.role === 'customer' ? styles.roleButtonActive : {}),
              }}
              onClick={() => handleRoleChange('customer')}
            >
              <FaRegUser /> Customer
            </button>
            <button
              type="button"
              style={{
                ...styles.roleButton,
                ...(form.role === 'priest' ? styles.roleButtonActive : {}),
              }}
              onClick={() => handleRoleChange('priest')}
            >
              <FaRegUser /> Priest {/* Changed icon back to FaRegUser */}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* PERSONAL INFORMATION SECTION */}
          <div>
            <h3 style={styles.sectionHeading}>
              <FaRegUser /> Personal Information
            </h3>
            <div style={styles.formGrid}>
              {/* FIRST NAME */}
              <div style={styles.inputContainer}>
                <label htmlFor="firstName" style={styles.inputLabel}>First Name</label>
                <div style={styles.inputGroup}>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="e.g. Ramesh"
                    value={form.firstName}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* LAST NAME */}
              <div style={styles.inputContainer}>
                <label htmlFor="lastName" style={styles.inputLabel}>Last Name</label>
                <div style={styles.inputGroup}>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="e.g. Sharma"
                    value={form.lastName}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* EMAIL ID */}
              <div style={styles.inputContainer}>
                <label htmlFor="email" style={styles.inputLabel}>Email ID</label>
                <div style={styles.inputGroup}>
                  <MdOutlineMailOutline style={styles.inputIcon} />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="user@example.com"
                    value={form.email}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* PHONE NUMBER */}
              <div style={styles.inputContainer}>
                <label htmlFor="phone" style={styles.inputLabel}>Phone Number</label>
                <div style={styles.inputGroup}>
                  <MdOutlinePhone style={styles.inputIcon} />
                  <input
                    id="phone"
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
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div style={styles.inputContainer}>
                <label htmlFor="password" style={styles.inputLabel}>Password</label>
                <div style={styles.inputGroup}>
                  <MdOutlineLock style={styles.inputIcon} />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={form.password}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                  <span
                    onClick={() => setShowPassword(!showPassword)}
                    style={styles.passwordToggle}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {passwordError && <p style={styles.errorText}>{passwordError}</p>}
              </div>

              {/* CONFIRM PASSWORD */}
              <div style={styles.inputContainer}>
                <label htmlFor="confirmPassword" style={styles.inputLabel}>Confirm Password</label>
                <div style={styles.inputGroup}>
                  <MdOutlineLock style={styles.inputIcon} />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="********"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                  <span
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={styles.passwordToggle}
                  >
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                {confirmPasswordError && <p style={styles.errorText}>{confirmPasswordError}</p>}
              </div>
            </div>
          </div>

          {/* ADDRESS SECTION */}
          <div>
            <h3 style={styles.sectionHeading}>
              <BsHouseDoor /> Address
            </h3>
            <div style={styles.formGrid}>
              {/* ADDRESS LINE 1 */}
              <div style={{ ...styles.inputContainer, ...styles.formRow }}>
                <label htmlFor="addressLine1" style={styles.inputLabel}>Address Line 1</label>
                <div style={styles.inputGroup}>
                  <input
                    id="addressLine1"
                    name="addressLine1"
                    type="text"
                    placeholder="House No, Street Name"
                    value={form.addressLine1}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* ADDRESS LINE 2 (Optional) */}
              <div style={{ ...styles.inputContainer, ...styles.formRow }}>
                <label htmlFor="addressLine2" style={styles.inputLabel}>Address Line 2 (Optional)</label>
                <div style={styles.inputGroup}>
                  <input
                    id="addressLine2"
                    name="addressLine2"
                    type="text"
                    placeholder="Apartment, Suite, Landmark"
                    value={form.addressLine2}
                    onChange={handleChange}
                    style={styles.authInput}
                  />
                </div>
              </div>

              {/* CITY */}
              <div style={styles.inputContainer}>
                <label htmlFor="city" style={styles.inputLabel}>City</label>
                <div style={styles.inputGroup}>
                  <input
                    id="city"
                    name="city"
                    type="text"
                    placeholder="e.g. Irving"
                    value={form.city}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* STATE */}
              <div style={styles.inputContainer}>
                <label htmlFor="state" style={styles.inputLabel}>State</label>
                <div style={styles.inputGroup}>
                  <input
                    id="state"
                    name="state"
                    type="text"
                    placeholder="e.g. Texas"
                    value={form.state}
                    onChange={handleChange}
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>

              {/* ZIP / PIN Code */}
              <div style={styles.inputContainer}>
                <label htmlFor="zipCode" style={styles.inputLabel}>ZIP Code</label>
                <div style={styles.inputGroup}>
                  <input
                    id="zipCode"
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
                    style={styles.authInput}
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PRIEST DETAILS SECTION (CONDITIONAL) */}
          {form.role === 'priest' && (
            <div>
              <h3 style={styles.sectionHeading}>Priest Details</h3>
              <div style={styles.formGrid}>
                {/* ABOUT YOU */}
                <div style={{ ...styles.inputContainer, ...styles.formRow }}>
                  <label htmlFor="bio" style={styles.inputLabel}>About You</label>
                  <textarea
                    id="bio"
                    name="bio"
                    placeholder="Tell us about your experience and background..."
                    value={form.bio}
                    onChange={handleChange}
                    style={styles.authTextarea}
                    rows="5"
                    required
                  ></textarea>
                </div>

                {/* SERVICES OFFERED (now a multi-select) */}
                <div style={{ ...styles.inputContainer, ...styles.formRow }}>
                  <label htmlFor="servicesOfferedSelect" style={styles.inputLabel}>Services Offered</label>
                  <Select
                    id="servicesOfferedSelect"
                    isMulti
                    name="servicesOffered"
                    options={availableServices}
                    value={form.selectedServices}
                    onChange={handleServicesChange}
                    placeholder="Select Services You Offer"
                    styles={styles.reactSelect}
                    required={form.role === 'priest' && form.selectedServices.length === 0}
                  />
                  <small style={styles.smallText}>
                    Please select all the spiritual services you provide.
                  </small>
                </div>

                {/* DO YOU OFFER JATAKAM (HOROSCOPE READING)? */}
                <div style={{ ...styles.inputContainer, ...styles.formRow }}>
                  <p style={styles.inputLabel}>Do you offer Jatakam (Horoscope Reading)?</p>
                  <div style={styles.radioGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="radio"
                        name="offersHoroscopeReading"
                        value="yes"
                        checked={form.offersHoroscopeReading === true}
                        onChange={() => setForm({ ...form, offersHoroscopeReading: true })}
                        style={styles.checkboxInput}
                      />{' '}
                      Yes
                    </label>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="radio"
                        name="offersHoroscopeReading"
                        value="no"
                        checked={form.offersHoroscopeReading === false}
                        onChange={() => setForm({ ...form, offersHoroscopeReading: false })}
                        style={styles.checkboxInput}
                      />{' '}
                      No
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.authBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p style={styles.switchLink}>
          Already have an account?{' '}
          <a onClick={() => navigate('/login')} style={styles.link}>
            Login
          </a>
        </p>
      </div>
    </div>
  );
};

export default SignUp;