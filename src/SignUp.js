import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const SignUp = () => {
  const navigate = useNavigate();
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    role: '',
    poojas: [],
  });

  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password validation
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
  };

  const handlePasswordChange = (e) => {
    const { value } = e.target;
    setPasswordError(validatePassword(value));
    setForm({ ...form, password: value });
  };

  // Load available poojas
  useEffect(() => {
    fetch(`${API_URL}/api/events`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch poojas');
        return res.json();
      })
      .then((data) => {
        setAvailablePoojas(
          data.map((event) => ({
            label: event.name,
            value: event.id,
          }))
        );
      })
      .catch((err) => {
        console.error('Error loading poojas:', err);
        setError('Failed to load services. Please try again later.');
      });
  }, [API_URL]);

  const handlePoojaChange = (selectedOptions) => {
    const selectedPoojas = selectedOptions 
      ? selectedOptions.map((option) => ({ id: option.value })) 
      : [];
    setForm({ ...form, poojas: selectedPoojas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Validate form
    const validationError = validatePassword(form.password);
    if (validationError) {
      setPasswordError(validationError);
      return;
    }

    if (!form.role) {
      setError('Please select a role');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`${API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
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

  // Inline CSS matching your original UI
  const styles = {
    authContainer: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f5f5f5',
      padding: '20px',
    },
    authCard: {
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
      padding: '30px',
      width: '100%',
      maxWidth: '500px',
    },
    authTitle: {
      textAlign: 'center',
      marginBottom: '20px',
      color: '#333',
      fontSize: '24px',
    },
    authForm: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    },
    inputGroup: {
      position: 'relative',
      marginBottom: '15px',
    },
    authInput: {
      width: '95%',
      padding: '12px 15px',
      borderRadius: '4px',
      border: '1px solid #ddd',
      fontSize: '16px',
    },
    passwordToggle: {
      position: 'absolute',
      right: '10px',
      top: '50%',
      transform: 'translateY(-50%)',
      cursor: 'pointer',
      color: '#555',
    },
    errorText: {
      color: 'red',
      fontSize: '14px',
      marginTop: '5px',
    },
    authBtn: {
      backgroundColor: '#4CAF50',
      color: 'white',
      border: 'none',
      padding: '12px',
      borderRadius: '4px',
      fontSize: '16px',
      cursor: 'pointer',
      marginTop: '10px',
      opacity: isSubmitting ? 0.7 : 1,
      pointerEvents: isSubmitting ? 'none' : 'auto',
    },
    switchLink: {
      textAlign: 'center',
      marginTop: '20px',
      color: '#666',
    },
    link: {
      color: '#4CAF50',
      cursor: 'pointer',
      textDecoration: 'underline',
    },
    roleSelection: {
      display: 'flex',
      gap: '20px',
      alignItems: 'center',
      marginBottom: '20px',
    },
    reactSelect: {
      width: '100%',
      fontSize: '16px',
    },
  };

  return (
    <div style={styles.authContainer}>
      <div style={styles.authCard}>
        <h2 style={styles.authTitle}>Sign Up</h2>
        <form onSubmit={handleSubmit} style={styles.authForm}>

          {/* ROLE SELECTION */}
          <div style={styles.roleSelection}>
            <label>
              <input
                type="checkbox"
                checked={form.role === 'customer'}
                onChange={() => setForm({ ...form, role: 'customer', poojas: [] })}
              />{' '}
              Customer
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.role === 'priest'}
                onChange={() => setForm({ ...form, role: 'priest' })}
              />{' '}
              Priest
            </label>
          </div>

          {/* USERNAME */}
          <div style={styles.inputGroup}>
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              style={styles.authInput}
              required
            />
          </div>

          {/* PASSWORD */}
          <div style={styles.inputGroup}>
            <input
              name="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={form.password}
              onChange={handlePasswordChange}
              style={styles.authInput}
              required
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={styles.passwordToggle}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {passwordError && <p style={styles.errorText}>{passwordError}</p>}
          </div>

          {/* FIRST NAME */}
          <div style={styles.inputGroup}>
            <input
              name="firstName"
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              style={styles.authInput}
              required
            />
          </div>

          {/* LAST NAME */}
          <div style={styles.inputGroup}>
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              style={styles.authInput}
              required
            />
          </div>

          {/* PHONE */}
          <div style={styles.inputGroup}>
            <input
              name="phone"
              type="text"
              placeholder="Phone Number"
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

          {/* ADDRESS */}
          <div style={styles.inputGroup}>
            <input
              name="address"
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              style={styles.authInput}
              required
            />
          </div>

          {/* POOJAS (PRIEST ONLY) */}
          {form.role === 'priest' && (
            <div style={styles.inputGroup}>
              <Select
                isMulti
                name="poojas"
                options={availablePoojas}
                onChange={handlePoojaChange}
                value={availablePoojas.filter((pooja) =>
                  form.poojas.some((selected) => selected.id === pooja.value)
                )}
                placeholder="Select Services"
                styles={{
                  control: (base) => ({
                    ...base,
                    padding: '6px',
                    fontSize: '16px',
                    borderColor: '#ddd',
                  }),
                }}
              />
            </div>
          )}

          {error && <p style={styles.errorText}>{error}</p>}

          <button type="submit" style={styles.authBtn} disabled={isSubmitting}>
            {isSubmitting ? 'Signing Up...' : 'Sign Up'}
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