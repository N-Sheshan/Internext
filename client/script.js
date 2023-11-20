import { io } from 'socket.io-client';

const socket = io('http://localhost:3000'); // replace with your server's URL

// Handle events or send messages here

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

