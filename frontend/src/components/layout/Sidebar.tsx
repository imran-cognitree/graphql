import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import NoteAddOutlined from '@mui/icons-material/NoteAddOutlined';
import StickyNote2Outlined from '@mui/icons-material/StickyNote2Outlined';

const DRAWER_WIDTH = 240;

interface SidebarProps {
  onNotesClick: () => void;
  onCreateClick: () => void;
}

export default function Sidebar({ onNotesClick, onCreateClick }: SidebarProps) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
      }}
    >
      <Toolbar />
      <Box sx={{ overflow: 'auto' }}>
        <List>
          <ListItemButton onClick={onNotesClick}>
            <ListItemIcon>
              <StickyNote2Outlined />
            </ListItemIcon>
            <ListItemText primary="Notes" />
          </ListItemButton>

          <Divider sx={{ my: 0.5 }} />

          <ListItemButton onClick={onCreateClick}>
            <ListItemIcon>
              <NoteAddOutlined />
            </ListItemIcon>
            <ListItemText primary="Create Note" />
          </ListItemButton>
        </List>
      </Box>
    </Drawer>
  );
}

