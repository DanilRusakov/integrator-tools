import { useState } from "react";
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    Box, 
    Button,
    Menu,
    MenuItem,
    IconButton
} from "@mui/material";
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import BuildIcon from '@mui/icons-material/Build';
import TextExtractor from './tools/TextExtractor';
import FormNormalizer from './tools/FormNormalizer';
import usePageTitle from '../hooks/usePageTitle';

function AppContent({ darkMode, handleThemeToggle }) {
  // Use the custom hook for dynamic page titles (now inside Router context)
  usePageTitle();

  // State for Tools menu
  const [toolsAnchorEl, setToolsAnchorEl] = useState(null);

  const toolsMenuOpen = Boolean(toolsAnchorEl);

  // Handlers for Tools menu
  const handleToolsMenuClick = (event) => {
    setToolsAnchorEl(event.currentTarget);
  };
  const handleToolsMenuClose = () => {
    setToolsAnchorEl(null);
  };

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography 
            variant="h6" 
            component={Link} 
            to="/text-extractor" 
            style={{ 
              flexGrow: 1, 
              textDecoration: 'none', 
              color: 'inherit',
              cursor: 'pointer'
            }}
          >
            Integrator Tools
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button
              color="inherit"
              onClick={handleToolsMenuClick}
              startIcon={<BuildIcon />}
            >
              Tools
            </Button>
            <Menu
              anchorEl={toolsAnchorEl}
              open={toolsMenuOpen}
              onClose={handleToolsMenuClose}
            >
              <MenuItem
                component={Link}
                to="/text-extractor"
                onClick={handleToolsMenuClose}
              >
                Text extractor
              </MenuItem>
              <MenuItem
                component={Link}
                to="/forms-normalizer"
                onClick={handleToolsMenuClose}
              >
                Forms normalizer
              </MenuItem>
            </Menu>
          </Box>
          <IconButton 
            color="inherit" 
            onClick={handleThemeToggle}
            sx={{ ml: 1 }}
          >
            {darkMode ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ p: 3 }}>
        <Routes>
          <Route path="/" element={<Navigate to="/text-extractor" replace />} />
          <Route path="/text-extractor" element={<TextExtractor />} />
          <Route path="/forms-normalizer" element={<FormNormalizer />} />
        </Routes>
      </Box>
    </>
  );
}

export default AppContent;
