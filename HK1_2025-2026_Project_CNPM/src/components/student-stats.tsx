"use client";

import { useEffect, useState } from 'react';
import api, { type StudentStats } from '@/lib/api';

export default function StudentStatsPanel() {
  const [stats, setStats] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
  const res = await api.get<StudentStats>('/api/driver/students/stats');
  const data = res.data;
        if (isMounted) {
          setStats(data);
        }
      } catch (e: any) {
        if (isMounted) setError(e?.message || 'Không thể tải thống kê');
      } finally {
        if (isMounted) setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-row justify-center space-x-4">
        <div className="animate-pulse h-20 w-56 bg-gray-200 rounded" />
        <div className="animate-pulse h-20 w-56 bg-gray-200 rounded" />
        <div className="animate-pulse h-20 w-56 bg-gray-200 rounded" />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  const pickedUp = stats?.pickedUp ?? 0;
  const total = stats?.total ?? 0;
  const waiting = stats?.assigned ?? 0;

  return (
    <div className="flex flex-row justify-center space-x-4">
      <div className="flex flex-row justify-center items-center space-x-2 border-2 border-stone-800 rounded-lg p-2 min-w-56">
        <div className="flex flex-col">
          <span className="text-xl font-semibold">{total}</span>
          <span className="text-sm text-gray-600">Tổng học sinh</span>
        </div>
      </div>

      <div className="flex flex-row justify-center items-center space-x-2 border-2 border-stone-800 rounded-lg p-2 min-w-56">
        <div className="flex flex-col">
          <span className="text-xl font-semibold">{waiting}</span>
          <span className="text-sm text-gray-600">Đã lên xe</span>
        </div>
      </div>

      <div className="flex flex-row justify-center items-center space-x-2 border-2 border-stone-800 rounded-lg p-2 min-w-56">
        <div className="flex flex-col">
          <span className="text-xl font-semibold">{pickedUp}</span>
          <span className="text-sm text-gray-600">Chờ đón</span>
        </div>
      </div>
    </div>
  );
}
