'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Pencil, 
  Pen, 
  Square, 
  Circle, 
  Eraser, 
  Undo, 
  Redo, 
  Save, 
  Paperclip, 
  Eye, 
  Type as TextIcon,
  Image as ImageIcon,
  Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';

// Types and Interfaces
type ToolName = 'pencil' | 'pen' | 'rectangle' | 'circle' | 'eraser' | 'text' | 'image';

interface Tool {
  name: ToolName;
  icon: React.ReactNode;
  cursor?: string;
}

interface Attachment {
  id: string;
  file: File;
  preview?: string;
  type: string;
}

interface DrawingState {
  startX: number;
  startY: number;
  isDrawing: boolean;
}

interface TextElement {
  id: string;
  x: number;
  y: number;
  text: string;
}

// Constants
const CANVAS_WIDTH = 794; // A4 width in pixels at 96 DPI
const CANVAS_HEIGHT = 1123; // A4 height in pixels at 96 DPI

const tools: Tool[] = [
  { name: 'pencil', icon: <Pencil className="h-4 w-4" />, cursor: 'crosshair' },
  { name: 'pen', icon: <Pen className="h-4 w-4" />, cursor: 'crosshair' },
  { name: 'rectangle', icon: <Square className="h-4 w-4" />, cursor: 'crosshair' },
  { name: 'circle', icon: <Circle className="h-4 w-4" />, cursor: 'crosshair' },
  { name: 'eraser', icon: <Eraser className="h-4 w-4" />, cursor: 'cell' },
  { name: 'text', icon: <TextIcon className="h-4 w-4" />, cursor: 'text' },
  { name: 'image', icon: <ImageIcon className="h-4 w-4" />, cursor: 'copy' },
];

export default function DocumentEditor() {
  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // State
  const [selectedTool, setSelectedTool] = useState<ToolName>('pencil');
  const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
  const [drawingState, setDrawingState] = useState<DrawingState>({
    startX: 0,
    startY: 0,
    isDrawing: false,
  });
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [textElements, setTextElements] = useState<TextElement[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  const [documentTitle, setDocumentTitle] = useState('Untitled Document');

  const { toast } = useToast();

  // Canvas Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Initialize canvas
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;

    // Set default styles
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setContext(ctx);

    // Save initial state
    const initialState = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory([initialState]);
    setHistoryIndex(0);
  }, []);

  // Tool Style Effect
  useEffect(() => {
    if (!context) return;

    switch (selectedTool) {
      case 'pencil':
        context.lineWidth = 1;
        context.strokeStyle = '#000000';
        break;
      case 'pen':
        context.lineWidth = 3;
        context.strokeStyle = '#000000';
        break;
      case 'rectangle':
      case 'circle':
        context.lineWidth = 2;
        context.strokeStyle = '#000000';
        break;
      case 'eraser':
        context.lineWidth = 20;
        context.strokeStyle = '#ffffff';
        break;
    }
  }, [selectedTool, context]);

  // Drawing Handlers
  const startDrawing = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!context || previewMode) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    setDrawingState({
      startX: x,
      startY: y,
      isDrawing: true,
    });

    if (selectedTool === 'pencil' || selectedTool === 'pen' || selectedTool === 'eraser') {
      context.beginPath();
      context.moveTo(x, y);
    }
  }, [context, previewMode, selectedTool]);

  const draw = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!drawingState.isDrawing || !context || !canvasRef.current || previewMode) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    switch (selectedTool) {
      case 'pencil':
      case 'pen':
      case 'eraser':
        context.lineTo(x, y);
        context.stroke();
        break;
      case 'rectangle':
        const lastState = history[historyIndex];
        if (lastState) {
          context.putImageData(lastState, 0, 0);
          const width = x - drawingState.startX;
          const height = y - drawingState.startY;
          context.strokeRect(drawingState.startX, drawingState.startY, width, height);
        }
        break;
      case 'circle':
        const prevState = history[historyIndex];
        if (prevState) {
          context.putImageData(prevState, 0, 0);
          const radius = Math.sqrt(
            Math.pow(x - drawingState.startX, 2) + Math.pow(y - drawingState.startY, 2)
          );
          context.beginPath();
          context.arc(drawingState.startX, drawingState.startY, radius, 0, Math.PI * 2);
          context.stroke();
        }
        break;
    }
  }, [drawingState, context, history, historyIndex, selectedTool, previewMode]);

  const stopDrawing = useCallback(() => {
    if (!drawingState.isDrawing || !context || !canvasRef.current) return;

    setDrawingState(prev => ({ ...prev, isDrawing: false }));
    context.closePath();

    // Save the current state to history
    const imageData = context.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    const newHistory = history.slice(0, historyIndex + 1);
    setHistory([...newHistory, imageData]);
    setHistoryIndex(prev => prev + 1);
  }, [drawingState.isDrawing, context, history, historyIndex]);

  // File Handling
  const handleAttachment = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = Array.from(files).map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      file,
      preview: URL.createObjectURL(file),
      type: file.type
    }));

    setAttachments(prev => [...prev, ...newAttachments]);
    toast({
      title: "Files attached",
      description: `${files.length} file(s) successfully attached`,
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !context || !canvasRef.current) return;

    const img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
      const aspectRatio = img.width / img.height;
      const maxWidth = canvasRef.current!.width * 0.8;
      const maxHeight = canvasRef.current!.height * 0.8;
      
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth) {
        width = maxWidth;
        height = width / aspectRatio;
      }
      
      if (height > maxHeight) {
        height = maxHeight;
        width = height * aspectRatio;
      }

      const x = (canvasRef.current!.width - width) / 2;
      const y = (canvasRef.current!.height - height) / 2;
      
      context.drawImage(img, x, y, width, height);
      
      // Save state to history
      const imageData = context.getImageData(0, 0, canvasRef.current!.width, canvasRef.current!.height);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), imageData]);
      setHistoryIndex(prev => prev + 1);
      
      URL.revokeObjectURL(img.src);
    };
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  };

  // History Handlers
  const undo = () => {
    if (historyIndex <= 0 || !context) return;
    const newIndex = historyIndex - 1;
    const imageData = history[newIndex];
    if (imageData) {
      context.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  const redo = () => {
    if (historyIndex >= history.length - 1 || !context) return;
    const newIndex = historyIndex + 1;
    const imageData = history[newIndex];
    if (imageData) {
      context.putImageData(imageData, 0, 0);
      setHistoryIndex(newIndex);
    }
  };

  // Save Document
  const saveDocument = async () => {
    if (!canvasRef.current) return;

    const formData = new FormData();
    formData.append('title', documentTitle);
    formData.append('canvas', canvasRef.current.toDataURL());
    attachments.forEach(attachment => {
      formData.append('attachments', attachment.file);
    });

    try {
      const response = await fetch('/api/documents/save', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) throw new Error('Failed to save document');

      toast({
        title: "Document saved",
        description: "Your document has been saved successfully",
      });
    } catch (error) {
      console.error('Error saving document:', error);
      toast({
        title: "Error",
        description: "Failed to save document. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[900px] mx-auto">
        <Card className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-4">
              <Input
                value={documentTitle}
                onChange={(e) => setDocumentTitle(e.target.value)}
                className="text-2xl font-bold w-64"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="h-4 w-4 mr-1" />
                {previewMode ? 'Edit' : 'Preview'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-4 w-4 mr-1" />
                Attach Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleAttachment}
                accept=".pdf,.doc,.docx,.txt"
              />
              <input
                ref={imageInputRef}
                type="file"
                className="hidden"
                onChange={handleImageUpload}
                accept="image/*"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={undo}
                disabled={historyIndex <= 0}
              >
                <Undo className="h-4 w-4 mr-1" /> Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
              >
                <Redo className="h-4 w-4 mr-1" /> Redo
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={saveDocument}
              >
                <Save className="h-4 w-4 mr-1" /> Save
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="bg-white rounded-lg shadow-lg p-4" style={{ 
                width: `${CANVAS_WIDTH}px`,
                minHeight: `${CANVAS_HEIGHT}px`,
                margin: '0 auto',
                position: 'relative'
              }}>
                {!previewMode && (
                  <div className="flex gap-4 mb-4 absolute top-4 left-4 bg-white/80 p-2 rounded-lg">
                    {tools.map((tool) => (
                      <Button
                        key={tool.name}
                        variant={selectedTool === tool.name ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setSelectedTool(tool.name);
                          if (tool.name === 'image') {
                            imageInputRef.current?.click();
                          }
                        }}
                        style={{ cursor: tool.cursor }}
                      >
                        {tool.icon}
                      </Button>
                    ))}
                  </div>
                )}
                
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  className={`bg-white cursor-crosshair border shadow-sm ${previewMode ? 'pointer-events-none' : ''}`}
                  style={{
                    width: '100%',
                    height: 'auto',
                    cursor: tools.find(t => t.name === selectedTool)?.cursor
                  }}
                />
              </div>
            </div>

            {/* Attachments Panel */}
            <div className="w-64">
              <h3 className="font-semibold mb-2">Attachments</h3>
              <div className="space-y-2">
                {attachments.map(attachment => (
                  <div key={attachment.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                    <span className="truncate text-sm">{attachment.file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeAttachment(attachment.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
                {attachments.length === 0 && (
                  <div className="text-sm text-gray-500 text-center py-4">
                    No attachments yet
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}