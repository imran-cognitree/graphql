import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
  onNotesClick: () => void;
  onCreateClick: () => void;
}

export default function MainLayout({ children, onNotesClick, onCreateClick }: MainLayoutProps) {
  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <Typography variant="h6" noWrap component="div">
            Notes App
          </Typography>
        </Toolbar>
      </AppBar>

      <Sidebar onNotesClick={onNotesClick} onCreateClick={onCreateClick} />

      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: '64px' }}>
        {children}
      </Box>
    </Box>
  );
}

