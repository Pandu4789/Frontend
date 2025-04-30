import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
const SignUp = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    poojas: [], // Important: should be array of {id: value}
  });

  const [availablePoojas, setAvailablePoojas] = useState([]);
  const [error, setError] = useState('');
  // const [pform, setPForm] = useState({ password: '' });
  const [showPassword, setShowPassword] = useState(false);

  const phandleChange = (e) => {
    const { name, value } = e.target;

    // Validation logic
    if (name === 'password') {
      const isValid =
        value.length >= 8 &&
        /[A-Z]/.test(value) &&     // at least one uppercase
        /[a-z]/.test(value) &&     // at least one lowercase
        /[0-9]/.test(value) &&     // at least one digit
        /[^A-Za-z0-9]/.test(value); // at least one special char

      if (!isValid && value.length > 0) {
        console.log("Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.");
      }
    }

    setForm({ ...form, [name]: value });
  };
  // Fetch available poojas (events)
  useEffect(() => {
    fetch('http://localhost:8080/api/events') // <-- you need this endpoint
      .then((res) => res.json())
      .then((data) => {
        const poojasList = data.map((event) => ({
          label: event.name,
          value: event.id,
        }));
        setAvailablePoojas(poojasList);
      })
      .catch((err) => {
        console.error('Failed to load poojas', err);
        setError('Failed to load poojas. Please try again later.');
      });
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePoojaChange = (selectedOptions) => {
    // Corrected: sending array of objects {id: value}
    const selectedPoojas = selectedOptions.map((option) => ({ id: option.value }));
    setForm({ ...form, poojas: selectedPoojas });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('Submitting form:', form); // <-- Very helpful for debugging

    try {
      const res = await fetch('http://localhost:8080/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        alert('Signup successful!');
        navigate('/login');
      } else {
        try {
          const errorData = await res.json();
          setError(errorData.message || JSON.stringify(errorData));
        } catch (e) {
          const text = await res.text();
          setError(text);
        }
      }
    } catch (err) {
      setError('Signup failed. Try again later.');
    }
  };
  
  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">Sign Up</h2>
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <input
              name="username"
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <div className="input-group" style={{ position: 'relative' }}>
      <input
        name="password"
        type={showPassword ? 'text' : 'password'}
        placeholder="Password"
        value={form.password}
        onChange={phandleChange}
        className="auth-input"
        required
      />
      <span
        onClick={() => setShowPassword(!showPassword)}
        style={{
          position: 'absolute',
          right: '10px',
          top: '50%',
          transform: 'translateY(-50%)',
          cursor: 'pointer',
          color: '#555',
        }}
      >
        {showPassword ? <FaEyeSlash /> : <FaEye />}
      </span>
    </div>
          <div className="input-group">
            <input
              name="firstName"
              type="text"
              placeholder="First Name"
              value={form.firstName}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <div className="input-group">
            <input
              name="lastName"
              type="text"
              placeholder="Last Name"
              value={form.lastName}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>
          <div className="input-group">
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
    className="auth-input"
    required
  />
</div>

          <div className="input-group">
            <input
              name="address"
              type="text"
              placeholder="Address"
              value={form.address}
              onChange={handleChange}
              className="auth-input"
              required
            />
          </div>

          {/* React Select multi-select dropdown */}
          <div className="input-group">
            <Select
              isMulti
              name="poojas"
              options={availablePoojas}
              onChange={handlePoojaChange}
              value={availablePoojas.filter((pooja) =>
                form.poojas.some(selected => selected.id === pooja.value)
              )}
              getOptionLabel={(e) => e.label}
              getOptionValue={(e) => e.value}
              placeholder="Select Services"
              className="react-select"
            />
          </div>

          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="auth-btn">Sign Up</button>
        </form>

        <p className="switch-link">
          Already have an account? <a onClick={() => navigate('/login')} className="link">Login</a>
        </p>
      </div>
    </div>
  );
};
export default SignUp;
