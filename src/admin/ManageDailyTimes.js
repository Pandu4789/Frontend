import React, { useEffect, useState } from "react";
import axios from "axios";

const styles = {
  container: {
    maxWidth: "900px",
    margin: "20px auto",
    padding: "15px",
    fontFamily: "Arial, sans-serif",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  formBox: {
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    background: "#f9f9f9",
  },
  formRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    gap: "10px",
  },
  label: {
    width: "130px",
    fontWeight: "bold",
  },
  input: {
    padding: "6px",
    fontSize: "14px",
    flex: 1,
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    borderRadius: "4px",
  },
  cancelButton: {
    padding: "8px 16px",
    backgroundColor: "#6c757d",
    border: "none",
    color: "white",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "10px",
    marginLeft: "10px",
    borderRadius: "4px",
  },
  deleteButton: {
    backgroundColor: "#dc3545",
    padding: "6px 12px",
    border: "none",
    color: "white",
    cursor: "pointer",
    borderRadius: "4px",
  },
  statusMsg: {
    marginTop: "10px",
    textAlign: "center",
    fontWeight: "bold",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "25px",
  },
  th: {
    border: "1px solid #ccc",
    padding: "8px",
    backgroundColor: "#eee",
  },
  td: {
    border: "1px solid #ccc",
    padding: "8px",
    textAlign: "center",
  },
};

const ManageDailyTimes = () => {
  const [formData, setFormData] = useState({
    date: "",
    rahukalamStart: "",
    rahukalamEnd: "",
    yamagandamStart: "",
    yamagandamEnd: "",
    varjamStart: "",
    varjamEnd: "",
    durmohurtamStart: "",
    durmohurtamEnd: "",
  });

  const [dailyTimesList, setDailyTimesList] = useState([]);
  const [status, setStatus] = useState("");
  const [editId, setEditId] = useState(null);

  const fetchDailyTimes = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/daily-times");
      setDailyTimesList(res.data);
    } catch (err) {
      console.error("Error fetching:", err);
    }
  };

  useEffect(() => {
    fetchDailyTimes();
  }, []);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(editId ? "Updating..." : "Submitting...");

    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/daily-times/${editId}`, formData);
        setStatus("✅ Updated successfully");
      } else {
        await axios.post("http://localhost:8080/api/daily-times", formData);
        setStatus("✅ Saved successfully");
      }

      setFormData({
        date: "",
        rahukalamStart: "",
        rahukalamEnd: "",
        yamagandamStart: "",
        yamagandamEnd: "",
        varjamStart: "",
        varjamEnd: "",
        durmohurtamStart: "",
        durmohurtamEnd: "",
      });
      setEditId(null);
      fetchDailyTimes();
    } catch (error) {
      console.error("Error submitting:", error);
      setStatus("❌ Failed to save");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this entry?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/daily-times/${id}`);
      fetchDailyTimes();
    } catch (err) {
      console.error("Error deleting:", err);
    }
  };

  const handleEdit = (item) => {
    setFormData({
      date: item.date,
      rahukalamStart: item.rahukalamStart,
      rahukalamEnd: item.rahukalamEnd,
      yamagandamStart: item.yamagandamStart,
      yamagandamEnd: item.yamagandamEnd,
      varjamStart: item.varjamStart,
      varjamEnd: item.varjamEnd,
      durmohurtamStart: item.durmohurtamStart,
      durmohurtamEnd: item.durmohurtamEnd,
    });
    setEditId(item.id);
    setStatus("Editing entry...");
  };

  const handleCancelEdit = () => {
    setFormData({
      date: "",
      rahukalamStart: "",
      rahukalamEnd: "",
      yamagandamStart: "",
      yamagandamEnd: "",
      varjamStart: "",
      varjamEnd: "",
      durmohurtamStart: "",
      durmohurtamEnd: "",
    });
    setEditId(null);
    setStatus("");
  };

  const renderTimeRow = (label, start, end) => (
    <div style={styles.formRow}>
      <label style={styles.label}>{label}:</label>
      <input
        type="time"
        name={start}
        value={formData[start]}
        onChange={handleChange}
        required
        style={styles.input}
      />
      <span>to</span>
      <input
        type="time"
        name={end}
        value={formData[end]}
        onChange={handleChange}
        required
        style={styles.input}
      />
    </div>
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Admin – {editId ? "Edit" : "Add"} Daily Times</h2>

      <form onSubmit={handleSubmit} style={styles.formBox}>
        <div style={styles.formRow}>
          <label style={styles.label}>Date:</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            required
            style={styles.input}
          />
        </div>

        {renderTimeRow("Rahukalam", "rahukalamStart", "rahukalamEnd")}
        {renderTimeRow("Yamagandam", "yamagandamStart", "yamagandamEnd")}
        {renderTimeRow("Varjam", "varjamStart", "varjamEnd")}
        {renderTimeRow("Durmuhurtam", "durmohurtamStart", "durmohurtamEnd")}

        <button type="submit" style={styles.button}>
          {editId ? "Update" : "Save"}
        </button>

        {editId && (
          <button
            type="button"
            onClick={handleCancelEdit}
            style={styles.cancelButton}
          >
            Cancel
          </button>
        )}

        {status && <p style={styles.statusMsg}>{status}</p>}
      </form>

      <h3 style={styles.heading}>Existing Daily Times</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Date</th>
            <th style={styles.th}>Rahukalam</th>
            <th style={styles.th}>Yamagandam</th>
            <th style={styles.th}>Varjam</th>
            <th style={styles.th}>Durmuhurtam</th>
            <th style={styles.th}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dailyTimesList.map((item) => (
            <tr key={item.id}>
              <td style={styles.td}>{item.date}</td>
              <td style={styles.td}>
                {item.rahukalamStart} - {item.rahukalamEnd}
              </td>
              <td style={styles.td}>
                {item.yamagandamStart} - {item.yamagandamEnd}
              </td>
              <td style={styles.td}>
                {item.varjamStart} - {item.varjamEnd}
              </td>
              <td style={styles.td}>
                {item.durmohurtamStart} - {item.durmohurtamEnd}
              </td>
              <td style={styles.td}>
                <button
                  style={{ ...styles.button, marginRight: "6px" }}
                  onClick={() => handleEdit(item)}
                >
                  Edit
                </button>
                <button
                  style={styles.deleteButton}
                  onClick={() => handleDelete(item.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {dailyTimesList.length === 0 && (
            <tr>
              <td colSpan="6" style={styles.td}>
                No records found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageDailyTimes;
