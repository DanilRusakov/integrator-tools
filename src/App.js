import { useState } from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import AppContent from "./components/AppContent";
import './App.css';

function App() {
  // State to toggle between light and dark modes
  const [darkMode, setDarkMode] = useState(false);

  // Create the theme object dynamically based on the darkMode state
  const theme = createTheme({
    palette: {
      mode: darkMode ? "light" : "dark" , // Toggle between dark and light mode
    },
  });

  // Toggle the theme mode when the switch is clicked
  const handleThemeToggle = () => {
    setDarkMode(!darkMode);
  };

  // Get basename for GitHub Pages deployment
  // In production build, PUBLIC_URL will be set to the repository name
  // In local development, it will be empty
  const basename = process.env.PUBLIC_URL || '';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router basename={basename}>
        <AppContent 
          darkMode={darkMode} 
          handleThemeToggle={handleThemeToggle} 
        />
      </Router>
    </ThemeProvider>
  );
}

export default App;
