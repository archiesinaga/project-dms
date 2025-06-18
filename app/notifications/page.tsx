'use client';
import { useEffect, useState } from "react";
import { XCircleIcon } from "@heroicons/react/24/outline";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetch('/api/notifications')
      .then(res => res.json())
      .then(data => setNotifications(data));
    // Tandai semua sebagai sudah dibaca
    fetch('/api/notifications', { method: 'PATCH' });
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Notifikasi</h1>
      {notifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <XCircleIcon className="w-16 h-16 text-gray-300 mb-4" />
          <p className="text-gray-500 text-lg text-center">
            Admin belum upload, edit, atau hapus dokumen.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n: any) => (
            <li key={n.id} className="bg-white p-4 rounded shadow">
              <span>{n.message}</span>
              <span className="block text-xs text-gray-400 mt-1">{new Date(n.createdAt).toLocaleString("id-ID")}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}