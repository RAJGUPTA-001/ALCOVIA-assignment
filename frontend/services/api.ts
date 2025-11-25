import axios from 'axios';

// Change this to your deployed backend URL
const BACKEND_URL = process.env.BACKEND_URL||'http://localhost:3000'; // Local development
// const API_URL = 'https://your-backend.onrender.com'; // Production

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Get student data by email (login)
  getStudent: async (studentEmail: string) => {
    try {
      // console.log('📡 API: Getting student by email:', studentEmail);
      const response = await api.post(`/auth/login`, {
        email: studentEmail
      });
      // console.log('✅ API: Student data received:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      // console.error('❌ API: Failed to fetch student:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to fetch student data'
      };
    }
  },

  // Submit daily check-in
  submitCheckin: async (
    studentId: number,        // Database ID (primary key)
    studentEmail: string,     // Email for identification
    quizScore: number,
    focusMinutes: number,
    tabSwitches: number = 0
  ) => {
    try {
      // console.log('📡 API: Submitting check-in:', {
      //   studentId,
      //   email: studentEmail,
      //   quizScore,
      //   focusTime: focusMinutes,
      //   tabSwitches
      // });

      const response = await api.post('/createlog', {
        studentId: studentId,
        email: studentEmail,      // ✅ Add email
        quizScore: quizScore,
        focusTime: focusMinutes,
        tabSwitches: tabSwitches  // ✅ Add tab switches
      });

      // console.log('✅ API: Check-in response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      // console.error('❌ API: Failed to submit check-in:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to submit check-in'
      };
    }
  },

  // Complete remedial task
  completeRemedial: async (studentEmail: string, interventionId: string) => {
    try {
      // console.log('📡 API: Completing remedial task:', {
      //   email: studentEmail,
      //   status: 'active',
        
      // });

      const response = await api.post('/complete-remedial', {
        email: studentEmail,
        status: 'active',
      });

      // console.log('✅ API: Remedial completion response:', response.data);
      return { success: true, data: response.data };
    } catch (error: any) {
      console.error('❌ API: Failed to complete remedial:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to complete remedial task'
      };
    }
  },
};

export default api;