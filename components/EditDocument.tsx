'use client';
import { useState } from "react";
import { useNotification } from "@/components/NotificationContext";
import { Edit, Loader2 } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface EditDocumentProps {
  id: string;
  currentTitle: string;
  currentDescription: string;
  onSuccess?: () => void;
}

export default function EditDocument({ 
  id, 
  currentTitle, 
  currentDescription, 
  onSuccess 
}: EditDocumentProps) {
  const [title, setTitle] = useState(currentTitle);
  const [description, setDescription] = useState(currentDescription);
  const [file, setFile] = useState<File | null>(null);
  const [revisionComment, setRevisionComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const { addNotification } = useNotification();

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
        addNotification("Document edited successfully!", "SUCCESS");
        setShowDialog(false);
        setRevisionComment("");
        if (onSuccess) onSuccess();
      } else {
        const error = await res.json();
        addNotification(error.error || "Failed to edit document.", "ERROR");
      }
    } catch (err) {
      addNotification("An error occurred while editing the document.", "ERROR");
    }
    setLoading(false);
  };

  const handleClose = () => {
    setShowDialog(false);
    setTitle(currentTitle);
    setDescription(currentDescription);
    setFile(null);
    setRevisionComment("");
  };

  return (
    <>
      <Button
        variant="outline"
        size="icon"
        onClick={() => setShowDialog(true)}
        className="hover:bg-yellow-100 hover:text-yellow-600"
      >
        <Edit className="h-4 w-4" />
      </Button>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Document</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleEdit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">New File (Optional)</Label>
              <div className="flex items-center justify-center w-full">
                <label
                  htmlFor="file"
                  className={cn(
                    "flex flex-col items-center justify-center w-full h-32",
                    "border-2 border-dashed rounded-lg cursor-pointer",
                    "hover:bg-gray-50 transition-colors duration-200",
                    "bg-gray-50"
                  )}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <svg
                      className="w-8 h-8 mb-4 text-gray-500"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 20 16"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                      />
                    </svg>
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500">
                      PDF, DOC, or DOCX (MAX. 10MB)
                    </p>
                  </div>
                  <Input
                    id="file"
                    type="file"
                    className="hidden"
                    onChange={e => setFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx"
                  />
                </label>
              </div>
              {file && (
                <p className="text-sm text-gray-500 mt-2">
                  Selected file: {file.name}
                </p>
              )}
            </div>

            {file && (
              <div className="space-y-2">
                <Label htmlFor="revisionComment">Revision Comment (Optional)</Label>
                <Textarea
                  id="revisionComment"
                  value={revisionComment}
                  onChange={e => setRevisionComment(e.target.value)}
                  placeholder="Describe what changes were made..."
                  rows={3}
                />
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}