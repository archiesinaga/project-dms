'use client';
import { useState } from "react";
import { useNotification } from "@/components/NotificationContext";

export default function EditDocument({ 
    id, 
    currentTitle, 
    currentDescription, 
    onSuccess 
}: { 
    id: string; 
    currentTitle: string; 
    currentDescription: string; 
    onSuccess?: () => void;
}) {
    const [title, setTitle] = useState(currentTitle);
    const [description, setDescription] = useState(currentDescription);
    const [file, setFile] = useState<File | null>(null);
    const [revisionComment, setRevisionComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const notification = useNotification();

    const handleEdit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append("id", id);
        formData.append("title", title);
        formData.append("description", description);
        if (file) formData.append("file", file);
        if (revisionComment) formData.append("revisionComment", revisionComment);

        try {
            const res = await fetch("/api/upload", {
                method: "PATCH",
                body: formData,
            });
            if (res.ok) {
                notification.notify({ message: "Dokumen berhasil diedit!", type: "SUCCESS" });
                setShowForm(false);
                setRevisionComment("");
                if (onSuccess) onSuccess();
            } else {
                const error = await res.json();
                notification.notify({ message: error.error || "Gagal mengedit dokumen.", type: "ERROR" });
            }
        } catch (err) {
            notification.notify({ message: "Terjadi kesalahan saat mengedit dokumen.", type: "ERROR" });
        }
        setLoading(false);
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 transition"
            >
                Edit
            </button>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                <h3 className="text-lg font-semibold mb-4">Edit Document</h3>
                <form onSubmit={handleEdit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            rows={3}
                            required
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            New File (Optional)
                        </label>
                        <input
                            type="file"
                            onChange={e => setFile(e.target.files?.[0] || null)}
                            accept=".pdf,.doc,.docx"
                            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {file && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Revision Comment (Optional)
                            </label>
                            <textarea
                                value={revisionComment}
                                onChange={e => setRevisionComment(e.target.value)}
                                placeholder="Describe what changes were made..."
                                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>
                    )}
                    
                    <div className="flex gap-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition disabled:bg-gray-400"
                        >
                            {loading ? "Saving..." : "Save"}
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setShowForm(false);
                                setRevisionComment("");
                            }}
                            className="flex-1 bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}