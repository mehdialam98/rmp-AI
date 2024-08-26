'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import { Stack, AppBar, Toolbar, Typography, Container, TextField, Button, Box, Paper } from '@mui/material';

export default function Home() {
  const [messages, setMessages] = useState([]); 
  const [message, setMessage] = useState(''); 
  const router = useRouter(); // Initialize the useRouter hook


  const sendMessage = async () => {
    setMessage('');
    setMessages((messages) => [
      ...messages,
      { role: 'user', content: message },
      { role: 'assistant', content: '' },
    ]);

    const response = fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify([...messages, { role: 'user', content: message }]),
    })
      .then(async (res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let result = '';

        return reader.read().then(function processText({ done, value }) {
          if (done) {
            return result;
          }
          const text = decoder.decode(value || new Uint8Array(), { stream: true });
          setMessages((messages) => {
            let lastMessage = messages[messages.length - 1];
            let otherMessages = messages.slice(0, messages.length - 1);
            return [
              ...otherMessages,
              { ...lastMessage, content: lastMessage.content + text },
            ];
          });
          return reader.read().then(processText);
        });
      });
  };

  const goBack = () => {
    router.push('/'); // Navigate back to the home page
  };

  return (
    <Box sx={{ flexGrow: 1, height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ backgroundColor: 'black', color: 'white' }}>
          <Typography variant="h5" component="div" sx={{ flexGrow: 1 }}>
            ProfReview AI
          </Typography>
          <Button color="inherit" sx={{ '&:hover': { backgroundColor: 'darkgray' } }} onClick ={goBack}>Home</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', mt: 4 }}>
        <Stack
          direction="column"
          spacing={2}
          sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}
        >
          {messages.map((message, index) => (
            <Box
              key={index}
              display="flex"
              justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
            >
              <Paper
                elevation={3}
                sx={{
                  p: 2,
                  bgcolor: message.role === 'assistant' ? 'lightgray' : 'lightblue',
                  maxWidth: '70%',
                  borderRadius: 2,
                }}
              >
                <Typography variant="body1">{message.content}</Typography>
              </Paper>
            </Box>
          ))}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <TextField
            fullWidth
            label="Message"
            variant="outlined"
            sx={{ mr: 1 }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
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
              },
            }}
            onClick={sendMessage}
          >
            Send
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
