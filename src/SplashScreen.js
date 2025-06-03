import React from "react";
import logo from "./assets/app-photo.jpg";

export default function SplashScreen() {
  return (
    <div style={styles.container}>
      <img src={logo} alt="App Logo" style={styles.image} />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#fff",
  },
  image: {
    width: "300px",
    height: "auto",
  },
};
