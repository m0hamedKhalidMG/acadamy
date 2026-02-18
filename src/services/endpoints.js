// services/endpoints.js
import API from './api';
import NotificationAPI from './notificationApi';

// Admin Auth
export const adminLogin = (data) => API.post('/auth/admin-login', data);
export const registerAdmin = (data) => API.post('/auth/setup-admin', data);

// Assistant Auth
export const assistantCardLogin = (data) => API.post('/auth/card-login', data);

// Assistant Management
export const createAssistant = (data) => API.post('/admin/assistants', data);
export const getAllAssistants = () => API.get('/admin/assistants');
export const resetAssistantPassword = (id, data) =>
  API.put(`/admin/assistants/${id}/reset-password`, data);
export const getAssistantProfile = () => API.get('/assistants/profile');
export const updateAssistantProfile = (data) =>
  API.put('/assistants/profile', data);

// Students Management
export const createStudent = (data) => API.post('/students', data);
export const getAllStudents = () => API.get('/students');

// Attendance Management
export const scanAttendance = (data) => API.post('/attendance/scan', data);
export const getTodayAttendance = () => API.get('/attendance/today');

export const getLatePayments = (params) =>
  API.get('/payments/late', { params });

// Get late payments for a specific group
// GET /payments/late?groupCode={groupCode}
export const getLatePaymentsByGroup = (groupCode) =>
  API.get('/payments/late', {
    params: { groupCode },
  });
// Payments summary (supports optional filters via params)
// Payments summary (no params)
export const getPaymentsSummary = () => API.get('/payments/summary');

// My suspensions
export const getMySuspensions = () => API.get('/assistants/my-suspensions');

// Suspend a student (temporary or permanent)
export const suspendStudent = (body) => API.post('/assistants/suspend', body);

// Lift a student's suspension by suspension‐record ID
// Lift a student's suspension (by student ID)
export const liftStudentSuspension = (studentId) => {
  if (!studentId) {
    return Promise.reject(new Error('No student ID provided'));
  }
  // must return the promise!
  return API.put(`/assistants/lift-suspension/${studentId}`);
};
// Record a payment
export const recordPayment = (data) => API.post('/payments', data);

// Get attendance records filtered by date and/or group
export const getAttendanceRecords = (params) =>
  API.get('/attendance/today', { params });

// Lift an assistant’s suspension
export const liftAssistantSuspension = (assistantId) =>
  API.put(`/assistants/lift-suspension/${assistantId}`);

// Attendance by date & group
export const getAttendanceByDateGroup = (params) =>
  API.get('/attendance/by-date-group', { params });

// Reminders via WhatsApp-bot (on its own server)
export const sendAttendanceNotification = (data) =>
  NotificationAPI.post('/notifications/attendance', data);

export const sendPaymentReminder = (data) =>
  NotificationAPI.post('/notifications/payment', data);

export const getGroupAttendanceReport = ({ month, year, groupCode }) =>
  API.get('/attendance/group-report', {
    params: { month, year, groupCode },
  });

export const getDailyGroupAttendance = ({ date, groupCode }) =>
  API.get('/attendance/daily-group', {
    params: { date, groupCode },
  });
// Send exam degrees (WhatsApp-bot on its own server)
// Send exam degrees (WhatsApp-bot on its own server)
export const sendExamDegreesNotification = (data) => {
  console.log('البيانات المستلمة:', data);
  
  // تنسيق الرسالة مع نتائج الامتحان
  const formatMessage = (examData) => {
    const { studentName, obtainedScore, totalScore, subjectName } = examData;
    const percentage = ((obtainedScore / totalScore) * 100).toFixed(1);
    
    return `*نتيجة الامتحان* 

عزيزي ولي الأمر،
الطالب ${studentName} 

📝 المادة: ${subjectName}
📊 الدرجة: ${obtainedScore}/${totalScore}
📈 النسبة المئوية: ${percentage}%
${obtainedScore >= totalScore/2 ? '✅ ناجح' : '📝 يحتاج إلى تحسين'}

مع الشكر،
إدارة مستر كريم
`;
  };

  // دالة فتح واتساب مع الرسالة
  const openWhatsApp = (phoneNumber, message) => {
    // تنظيف رقم الهاتف من أي رموز غير رقمية
    const cleanNumber = phoneNumber.replace(/\D/g, '');
    
    // التحقق من صحة الرقم (مصري يبدأ بـ 2010...)
    if (cleanNumber.startsWith('2010') && cleanNumber.length === 12) {
      // إنشاء رابط واتساب
      const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
      
      // فتح في تبويب جديد
      window.open(whatsappUrl, '_blank');
      console.log('تم فتح واتساب للرقم:', cleanNumber);
    } else {
      console.log('رقم هاتف غير صالح:', phoneNumber);
    }
  };

  // معالجة هياكل البيانات المختلفة
  let examResultsArray = [];
  
  // الحالة 1: البيانات عبارة عن مصفوفة مباشرة
  if (Array.isArray(data)) {
    examResultsArray = data;
  } 
  // الحالة 2: البيانات تحتوي على خاصية examResults وهي مصفوفة
  else if (data && data.examResults && Array.isArray(data.examResults)) {
    examResultsArray = data.examResults;
  }
  // الحالة 3: البيانات عبارة عن كائن واحد لنتيجة امتحان
  else if (data && typeof data === 'object' && data.studentName) {
    examResultsArray = [data];
  }

  // معالجة كل نتيجة امتحان
  if (examResultsArray.length > 0) {
    examResultsArray.forEach((examResult, index) => {
      // تأخير بين الرسائل لتجنب الحظر
      setTimeout(() => {
        const message = formatMessage(examResult);
        console.log('الرسالة:', message, 'لرقم ولي الأمر:', examResult.parentNumber);
        openWhatsApp(examResult.parentNumber, message);
      }, index * 2000); // تأخير ثانيتين بين كل رسالة
    });
    
    console.log(`جاري إرسال ${examResultsArray.length} نتيجة امتحان...`);
  } else {
    console.log('لا توجد نتائج امتحان صالحة للإرسال');
  }
};
// Update a student by ID
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);

// Mark a student as permanent by ID (no body)
// Mark a student as permanent (no body)
export const markStudentPermanent = (studentId) =>
  API.put(`/students/${studentId}/permanent`);

// Delete a student (true delete, no body)
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// Create a new group
export const createGroup = (data) => API.post('/groups', data);

// Get all groups
export const getAllGroups = () => API.get('/groups');

// Update an existing group by ID
export const updateGroup = (id, data) => API.put(`/groups/${id}`, data);

// Delete a group by ID
export const deleteGroup = (id) => API.delete(`/groups/${id}`);
