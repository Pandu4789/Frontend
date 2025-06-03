import React from "react";
import logo from "./Photos/image.png"; // Make sure the path is correct

export default function SplashScreen() {
  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <img src={logo} alt="App Logo" style={styles.image} />
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    width: "100vw",
    backgroundColor: "#f8c146", // Match the logo's yellow-orange theme
    flexDirection: "column",
  },
  content: {
    textAlign: "center",
  },
  image: {
    width: "500px", // Smaller image for center splash
    height: "auto",
    marginBottom: "20px",
  },
  tagline: {
    fontSize: "1.5rem",
    fontWeight: "500",
    color: "#3a2e1f", // Darker for contrast
    fontFamily: "sans-serif",
  },
};
