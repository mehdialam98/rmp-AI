import React from 'react';
import { AppBar, Toolbar, Typography, Container, TextField, Button, Box } from '@mui/material';

export default function Home() {
  
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ backgroundColor: 'black', color: 'white' }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            ProfReview AI
          </Typography>
          <Button color="inherit" sx={{ '&:hover': { backgroundColor: 'darkgray' } }}>About</Button>
          <Button color="inherit" sx={{ '&:hover': { backgroundColor: 'darkgray' } }}>News</Button>
          <Button color="inherit" sx={{ '&:hover': { backgroundColor: 'darkgray' } }}>Read Me</Button>
        </Toolbar>
      </AppBar>
      <Box
        sx={{
          backgroundImage: 'url(/bck.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          height: '70vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          color: 'white',
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" gutterBottom>
          Choosing your Professor
        </Typography>
        <Typography variant="h5" gutterBottom>
          has
        </Typography>
        <Typography variant="h1" gutterBottom>
          Never been Easier
        </Typography>
      </Box>
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
          <TextField
            fullWidth
            label="Enter professor qualities (e.g. engaging, clear explanations)"
            variant="outlined"
            sx={{ mr: 1 }}
          />
          <Button 
            variant="contained" 
            sx={{ 
              height: 56, 
              backgroundColor: 'black',
              color: 'white',
              '&:hover': {
                backgroundColor: 'lightgray',
                color: 'black',
              }
            }}
          >
            Search
          </Button>
        </Box>
      </Container>
    </Box>
  );
};