import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('userToken');
    if (token) {
      config.headers = config.headers ?? {};
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export default api;

export type StudentStats = {
  maChuyenXe: number | null;
  total: number;
  pickedUp: number;
  droppedOff: number;
  assigned: number;
  other: number;
};

export const getStudentStats = async (): Promise<StudentStats> => {
  const res = await api.get('/api/driver/students/stats');
  return res.data as StudentStats;
};