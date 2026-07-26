import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Student {
  id: int;
  usn: string;
  name: string;
  department: string;
  semester: int;
}

export interface Teacher {
  id: int;
  name: string;
  email: string;
}

export interface Question {
  id: number;
  title: string;
  language: string;
  description: string;
  sample_input: string;
  sample_output: string;
  difficulty: string;
}

export interface Exam {
  id: number;
  title: string;
  duration: number;
  status: string;
  language: string;
  questions: Question[];
}

export const authApi = {
  studentLogin: async (usn: string): Promise<Student> => {
    const res = await api.post('/auth/student/login', { usn });
    return res.data;
  },
  teacherLogin: async (email: string, password: string): Promise<Teacher> => {
    const res = await api.post('/auth/teacher/login', { email, password });
    return res.data;
  },
  getStudents: async (): Promise<Student[]> => {
    const res = await api.get('/auth/students');
    return res.data;
  }
};

export const examApi = {
  getActiveExam: async (): Promise<Exam> => {
    const res = await api.get('/exams/active');
    return res.data;
  },
  getRandomQuestion: async (examId: number, studentId: number): Promise<Question> => {
    const res = await api.get(`/exams/${examId}/random-question/${studentId}`);
    return res.data;
  },
  createExam: async (title: string, duration: number, language: string): Promise<Exam> => {
    const res = await api.post('/exams/create', { title, duration, language });
    return res.data;
  }
};

export const submissionApi = {
  runCode: async (language: string, code: string, inputData: string = '') => {
    const res = await api.post('/submissions/run', {
      language,
      code,
      input_data: inputData,
    });
    return res.data;
  },
  submitCode: async (studentId: number, examId: number, questionId: number, code: string, language: string) => {
    const res = await api.post('/submissions/submit', {
      student_id: studentId,
      exam_id: examId,
      question_id: questionId,
      source_code: code,
      language,
    });
    return res.data;
  },
  getExamSubmissions: async (examId: number) => {
    const res = await api.get(`/submissions/exam/${examId}`);
    return res.data;
  }
};
