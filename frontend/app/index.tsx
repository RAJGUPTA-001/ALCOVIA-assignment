import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import LoginScreen from '../components/LoginScreen';
import DashboardScreen from '../components/DashboardScreen';
import LockedScreen from '../components/LockedScreen';
import RemedialScreen from '../components/RemedialScreen';
import { apiService } from '../services/api';
import socketService from '../services/socket';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [studentEmail, setStudentEmail] = useState('');
  const [studentID, setStudentID] = useState('');
  const [studentData, setStudentData] = useState<any>(null);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Socket listeners
  useEffect(() => {
    if (isLoggedIn && studentID) {
      console.log('🔌 Connecting socket for:', studentEmail,studentID);
      socketService.connect(studentID);

      // Real-time status update
      socketService.on('status_update', (data: any) => {
        console.log('📡 Status update:', data);
        setStudentData((prev: any) => ({ ...prev, status: data.status }));
        setMessage(data.message);
      });

      // Intervention assigned
      socketService.on('intervention_assigned', (data: any) => {
        console.log('📡 Intervention assigned:', data);
        setStudentData((prev: any) => ({
          ...prev,
          status: data.status,
          remedial_task: data.remedial_task,
          intervention_status: 'assigned'
        }));
        setMessage(data.message);
      });

      // Auto-unlock
      socketService.on('auto_unlocked', (data: any) => {
        console.log('📡 Auto-unlocked:', data);
        setStudentData((prev: any) => ({ ...prev, status: data.status }));
        setMessage(data.message);
      });

      return () => {
        socketService.disconnect();
      };
    }
  }, [isLoggedIn, studentEmail,studentID]);

  const handleLogin = async (email: string) => {
    console.log('🔐 Attempting login with email:', email);
    setLoading(true);
    try {
      const result = await apiService.getStudent(email);
      console.log('📊 Login result:', result);

      if (result.success && result.data) {
        console.log('✅ Login successful! Student data:', result.data);
        setStudentData(result.data);
        setStudentEmail(result.data.email);
        setStudentID(result.data.Id)
        setIsLoggedIn(true);
        setMessage(`Welcome, ${result.data.name}!`);
      } else {
        throw new Error(result.error || 'Student not found');
      }
    } catch (error: any) {
      console.error('❌ Login error:', error);
      throw new Error(error.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitCheckin = async (
    quizScore: number,
    focusMinutes: number,
    switches: number,
    studentId: number
  ) => {
    console.log('📤 Submitting check-in...', {
      studentId,
      email: studentEmail,
      quizScore,
      focusMinutes,
      tabSwitches: switches
    });

    setLoading(true);
    try {
      // ✅ Pass both studentId (DB primary key) AND email
      const result = await apiService.submitCheckin(
        studentId,
        studentEmail,  // ✅ Add email
        quizScore,
        focusMinutes,
        switches
      );

      console.log('📥 Check-in result:', result);

      if (result.success) {
        setMessage(result.data.status || 'Check-in submitted successfully');
        
        // Reload student data
        console.log('🔄 Reloading student data...');
        const studentResult = await apiService.getStudent(studentEmail);
        
        if (studentResult.success) {
          console.log('✅ Student data reloaded:', studentResult.data);
          setStudentData(studentResult.data);
        }

        // Reset tab switches
        setTabSwitches(0);
      } else {
        throw new Error(result.error || 'Failed to submit check-in');
      }
    } catch (error: any) {
      console.error('❌ Submit check-in error:', error);
      throw new Error(error.message || 'Failed to submit check-in');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRemedial = async () => {
    console.log('✅ Completing remedial task...');
    setLoading(true);
    try {
      const result = await apiService.completeRemedial(
        studentEmail,
        studentData.intervention_id
      );

      if (result.success) {
        setMessage(result.data.message);
        
        // Reload student data
        const studentResult = await apiService.getStudent(studentEmail);
        if (studentResult.success) {
          setStudentData(studentResult.data);
        }
      } else {
        throw new Error(result.error || 'Failed to complete task');
      }
    } catch (error: any) {
      console.error('❌ Complete remedial error:', error);
      throw new Error(error.message || 'Failed to complete task');
    } finally {
      setLoading(false);
    }
  };

  const handleTabSwitch = () => {
    setTabSwitches(prev => prev + 1);
    console.log('⚠️ Tab switch detected. Total:', tabSwitches + 1);
  };

  // Route based on login and student status
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (studentData?.status === 'locked' || studentData?.status === 'needs_intervention') {
    return (
      <>
        <LockedScreen message={message || 'Waiting for mentor review...'} />
        <StatusBar style="auto" />
      </>
    );
  }

  if (studentData?.status === 'remedial' && studentData?.remedial_task) {
    
    return (
      <>
        <RemedialScreen
          studentName={studentData.name}
          remedialTask={studentData.remedial_task}
          onComplete={handleCompleteRemedial}
        />
        <StatusBar style="auto" />
      </>
    );
  }

  return (
    <>
      <DashboardScreen
        studentData={studentData}
        onSubmitCheckin={handleSubmitCheckin}
        tabSwitches={tabSwitches}
        onTabSwitch={handleTabSwitch}
      />
      <StatusBar style="auto" />
    </>
  );
}