import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Camera, Image as ImageIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

interface MediaCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onMediaSelected: (mediaUrl: string, type: "image" | "gif" | "video") => void;
}

export default function MediaCaptureModal({
  open,
  onOpenChange,
  onMediaSelected,
}: MediaCaptureModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "gif" | "video">("image");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showCameraView, setShowCameraView] = useState(false);

  // Start the camera
  const startCamera = async () => {
    try {
      setIsLoading(true);
      setShowCameraView(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: {
          facingMode: "environment", 
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (cameraRef.current) {
        cameraRef.current.srcObject = stream;
      }
      
      setCameraStream(stream);
      setIsCameraAvailable(true);
    } catch (error) {
      setIsCameraAvailable(false);
      toast({
        title: "Camera error",
        description: "Could not access device camera.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Stop the camera
  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCameraView(false);
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileType = file.type;
    setIsLoading(true);

    if (fileType === "image/gif") {
      setMediaType("gif");
    } else if (fileType.startsWith("image/")) {
      setMediaType("image");
    } else if (fileType.startsWith("video/")) {
      setMediaType("video");
    } else {
      toast({
        title: "Unsupported format",
        description: "Please select a valid image.",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    // No backend upload, just use local preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    setIsLoading(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!cameraRef.current || !canvasRef.current) return;

    setIsLoading(true);
    const video = cameraRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context?.drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewUrl(dataUrl);
      setMediaType("image");
      stopCamera(); 
    } catch (error) {
      toast({
        title: "Capture error",
        description: "Could not capture photo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Confirm selected media
  const handleConfirmMedia = () => {
    if (!previewUrl) {
      toast({
        title: "No media selected",
        description: "Please select or capture media first.",
        variant: "destructive",
      });
      return;
    }

    // No backend upload; just pass previewUrl to parent
    onMediaSelected(previewUrl, mediaType);
    handleClose();
  };

  // Close modal
  const handleClose = () => {
    stopCamera();
    setPreviewUrl(null);
    setIsLoading(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md p-0 rounded-none sm:rounded-2xl bg-black h-[90vh] sm:h-auto border-0 overflow-hidden">
        <DialogHeader>
          <DialogTitle>Capture or Select Media</DialogTitle>
        </DialogHeader>
        {/* ...UI exactly as before... */}
      </DialogContent>
    </Dialog>
  );
}