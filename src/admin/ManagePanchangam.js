import React, { useEffect, useState } from "react";

export default function PanchangamForm() {
  const [nakshatrams, setNakshatrams] = useState([]);
  const [entries, setEntries] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(getEmptyForm());
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [loadingNakshatrams, setLoadingNakshatrams] = useState(false);

  const lagnams = [
    "Mesham (Aries)", "Vrishabham (Taurus)", "Mithunam (Gemini)", "Karkatakam (Cancer)",
    "Simham (Leo)", "Kanya (Virgo)", "Tula (Libra)", "Vrischikam (Scorpio)",
    "Dhanusu (Sagittarius)", "Makaram (Capricorn)", "Kumbham (Aquarius)", "Meenam (Pisces)"
  ];

  const pakshas = ["Shukla", "Krishna"];

  const tithis = [
    "Pratipada", "Dwitiya", "Tritiya", "Chaturthi", "Panchami", "Shashti",
    "Saptami", "Ashtami", "Navami", "Dashami", "Ekadashi", "Dwadashi",
    "Trayodashi", "Chaturdashi", "Pournami", "Amavasya"
  ];

  const vaarams = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  function getEmptyForm() {
    return {
      date: "", lagnam: "", mohurtam: "", paksha: "", tithi: "",
      vaaram: "", time: "", notes: "", nakshatram: ""
    };
  }

  useEffect(() => {
    setLoadingNakshatrams(true);
    fetch("http://localhost:8080/api/nakshatram")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setNakshatrams(data);
        } else {
          setNakshatrams([]);
          console.warn("Nakshatram response not array:", data);
        }
      })
      .catch(() => alert("Failed to load Nakshatrams"))
      .finally(() => setLoadingNakshatrams(false));

    fetchEntries();
  }, []);

  const fetchEntries = () => {
    setLoadingEntries(true);
    fetch("http://localhost:8080/api/panchangam")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setEntries(data);
        } else {
          setEntries([]);
          console.warn("Panchangam entries response not array:", data);
        }
      })
      .catch(() => alert("Failed to fetch Panchangam entries"))
      .finally(() => setLoadingEntries(false));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Map React keys to Java entity keys (case sensitive)
  const toBackendPayload = (form) => ({
    date: form.date,
    paksha: form.paksha,
    tithi: form.tithi,
    vaaram: form.vaaram,        // correct spelling as in Java entity
    nakshatram: form.nakshatram,
    lagnam: form.lagnam,
    mohurtam: form.mohurtam,   // capital M, as in entity
    time: form.time,            // capital T, as in entity
    notes: form.notes,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId
      ? `http://localhost:8080/api/panchangam/${editingId}`
      : "http://localhost:8080/api/panchangam";
    const method = editingId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(toBackendPayload(form)),
      });
      if (res.ok) {
        alert(editingId ? "Panchangam updated!" : "Panchangam added!");
        setForm(getEmptyForm());
        setEditingId(null);
        fetchEntries();
      } else {
        alert("Save failed");
      }
    } catch (err) {
      alert("Error while saving");
    }
  };

  const handleEdit = (entry) => {
    // Map backend keys back to React form keys:
    setForm({
      date: entry.date || "",
      paksha: entry.paksha || "",
      tithi: entry.tithi || "",
      vaaram: entry.vaaram || "",
      nakshatram: entry.nakshatram || "",
      lagnam: entry.lagnam || "",
      mohurtam: entry.mohurtam || "", // capital M in backend
      time: entry.time || "",          // capital T in backend
      notes: entry.notes || "",
    });
    setEditingId(entry.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this Panchangam entry?")) return;
    try {
      await fetch(`http://localhost:8080/api/panchangam/${id}`, {
        method: "DELETE"
      });
      fetchEntries();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>
        {editingId ? "Edit Panchangam" : "Add Panchangam"}
      </h2>
      <form onSubmit={handleSubmit}>
        <label style={styles.label}>Date:</label>
        <input type="date" name="date" value={form.date} onChange={handleChange} style={styles.input} required />

        <label style={styles.label}>Lagnam:</label>
        <select name="lagnam" value={form.lagnam} onChange={handleChange} style={styles.input} required>
          <option value="">Select</option>
          {lagnams.map((l, i) => <option key={i} value={l}>{l}</option>)}
        </select>

        <label style={styles.label}>Mohurtham:</label>
        <select name="mohurtam" value={form.mohurtam} onChange={handleChange} style={styles.input} required >
          <option value="">Select</option>
          {nakshatrams.map((n) => (
            <option key={n.id} value={n.name}>{n.name}</option>
          ))}
        </select>

        <label style={styles.label}>Paksha:</label>
        <select name="paksha" value={form.paksha} onChange={handleChange} style={styles.input} required>
          <option value="">Select</option>
          {pakshas.map((p, i) => <option key={i} value={p}>{p}</option>)}
        </select>

        <label style={styles.label}>Tithi:</label>
        <select name="tithi" value={form.tithi} onChange={handleChange} style={styles.input} required>
          <option value="">Select</option>
          {tithis.map((t, i) => <option key={i} value={t}>{t}</option>)}
        </select>

        <label style={styles.label}>Vaaram:</label>
        <select name="vaaram" value={form.vaaram} onChange={handleChange} style={styles.input} required>
          <option value="">Select</option>
          {vaarams.map((v, i) => <option key={i} value={v}>{v}</option>)}
        </select>

        <label style={styles.label}>Time:</label>
        <input type="time" name="time" value={form.time} onChange={handleChange} style={styles.input} />

        <label style={styles.label}>Nakshatram:</label>
        <select name="nakshatram" value={form.nakshatram} onChange={handleChange} style={styles.input} required disabled={loadingNakshatrams}>
          <option value="">{loadingNakshatrams ? "Loading..." : "Select"}</option>
          {nakshatrams.map((n) => (
            <option key={n.id} value={n.name}>{n.name}</option>
          ))}
        </select>

        <label style={styles.label}>Notes:</label>
        <textarea name="notes" rows="3" value={form.notes} onChange={handleChange} style={styles.textarea} />

        <button type="submit" style={styles.button}>
          {editingId ? "Update" : "Save"} Panchangam
        </button>
      </form>

      <h3 style={{ marginTop: "40px" }}>All Panchangam Entries</h3>

      {loadingEntries ? (
        <p>Loading entries...</p>
      ) : (
        <table border="1" cellPadding="6" style={{ width: "100%", marginTop: "10px" }}>
          <thead>
            <tr>
              <th>Date</th><th>Lagnam</th><th>Mohurtham</th><th>Paksha</th><th>Tithi</th>
              <th>Vaaram</th><th>Time</th><th>Nakshatram</th><th>Notes</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(entries) && entries.length > 0 ? (
              entries.map((e) => (
                <tr key={e.id}>
                  <td>{e.date}</td>
                  <td>{e.lagnam}</td>
                  <td>{e.mohurtam}</td>
                  <td>{e.paksha}</td>
                  <td>{e.tithi}</td>
                  <td>{e.vaaram}</td>
                  <td>{e.time}</td>
                  <td>{e.nakshatram}</td>
                  <td>{e.notes}</td>
                  <td>
                    <button onClick={() => handleEdit(e)}>✏️</button>{" "}
                    <button onClick={() => handleDelete(e.id)}>🗑️</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="10" style={{ textAlign: "center" }}>No entries found</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  container: {
    maxWidth: "900px",
    margin: "30px auto",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  heading: { textAlign: "center" },
  label: { display: "block", marginTop: "15px", marginBottom: "5px", fontWeight: "bold" },
  input: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  textarea: {
    width: "100%",
    padding: "8px",
    fontSize: "14px",
    boxSizing: "border-box",
  },
  button: {
    marginTop: "20px",
    padding: "10px 20px",
    fontSize: "16px",
    cursor: "pointer",
  },
};
