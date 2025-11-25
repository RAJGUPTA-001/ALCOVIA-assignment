// const socketIo = require('socket.io');
import {Server} from 'socket.io';

// Store socket connections by student_id for real-time updates
const studentSockets = new Map();

let io = null;

// /**
//  * Initialize Socket.io server
//  * @param {http.Server} server - HTTP server instance
//  * @param {string} frontendUrl - Frontend URL for CORS
//  */
const initializeSocket = (server, frontendUrl) => {
  io = new Server(server, {
    cors: {
      origin: frontendUrl || 'http://localhost:8081',
      methods: ['GET', 'POST']
    }
  });

  // WebSocket connection handler
  io.on('connection', (socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // Register student socket
    socket.on('register', (studentId) => {
      studentSockets.set(studentId, socket.id);
      console.log(`📝 Student ${studentId} registered with socket ${socket.id}`);
    });

    socket.on('disconnect', () => {
      // Remove socket from map
      for (let [studentId, socketId] of studentSockets.entries()) {
        if (socketId === socket.id) {
          studentSockets.delete(studentId);
          console.log(`👋 Student ${studentId} disconnected`);
          break;
        }
      }
    });
  });

  return io;
};

/**
 * Send real-time update to a specific student
 * @param {string} studentId - Student identifier
 * @param {string} event - Event name
 * @param {object} data - Data to send
 */
const notifyStudent = (studentId, event, data) => {
  if (!io) {
    console.warn('⚠️  Socket.io not initialized');
    return;
  }

  const socketId = studentSockets.get(studentId);
  if (socketId) {
    io.to(socketId).emit(event, data);
    console.log(`🔔 Sent ${event} to student ${studentId}`);
  } else {
    console.log(`⚠️  Student ${studentId} not connected via socket`);
  }
};

// /**
//  * Get total number of connected clients
//  * @returns {number} Number of connected clients
//  */
// const getConnectedClientsCount = () => {
//   return studentSockets.size;
// };

/**
 * Check if a student is currently connected
 * @param {string} studentId - Student identifier
 * @returns {boolean} True if student is connected
 */
const isStudentConnected = (studentId) => {
  return studentSockets.has(studentId);
};

export   {
  initializeSocket,
  notifyStudent,
  isStudentConnected
};