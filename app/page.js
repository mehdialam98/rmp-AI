'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppBar, Toolbar, Typography, Container, TextField, Button, Box } from '@mui/material';

export default function Home() {
  const [qualities, setQualities] = useState("");
  const [response, setResponse] = useState("");
  const router = useRouter(); // Initialize the useRouter hook

  const searchProfessors = async () => {
    setResponse("Searching for professors...");
    
    try {
      // Send the qualities to the /api/recommended endpoint
      const res = await fetch('/api/recommended', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ qualities }), // Send the input qualities to the API
      });

      if (!res.ok) {
        throw new Error("Failed to fetch recommendations");
      }

      const data = await res.json(); // Parse the JSON response

      setResponse(data.result); // Set the response with the result from the API

    } catch (error) {
      console.error("Error searching professors:", error);
      setResponse("An error occurred while searching for professors. Please try again.");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ backgroundColor: 'black', color: 'white' }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            ProfReview AI
          </Typography>
          <Button 
            color="inherit" 
            sx={{ '&:hover': { backgroundColor: 'darkgray' } }}
            onClick={() => router.push('/conversation')} // Navigate to the conversation page
          >
            Chat
          </Button>

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
            value={qualities}
            onChange={(e) => setQualities(e.target.value)}
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
            onClick={searchProfessors}
          >
            Search
          </Button>
        </Box>
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            minRows={3}
            maxRows={40}
            //rows={40}
            variant="outlined"
            value={response}
            InputProps={{
              readOnly: true,
            }}
          />
        </Box>
      </Container>
    </Box>
  );
}
