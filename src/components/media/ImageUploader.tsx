import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X, Image as ImageIcon, Camera } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';

interface ImageUploaderProps {
  onImageUploaded?: (imageUrl: string, thumbnailUrl?: string, webpUrl?: string) => void;
  maxImages?: number;
  showPreview?: boolean;
  previewSize?: number;
  buttonText?: string;
  allowMultiple?: boolean;
  className?: string;
}

export default function ImageUploader({
  onImageUploaded,
  maxImages = 1,
  showPreview = true,
  previewSize = 150,
  buttonText = "Choose image",
  allowMultiple = false,
  className = ""
}: ImageUploaderProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  // Maximum image size (10MB)
  const MAX_FILE_SIZE = 10 * 1024 * 1024;
  
  // Allowed file types
  const ACCEPTED_FORMATS = [
    'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'
  ];

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    const promises: Promise<void>[] = [];
    
    // Process each selected file
    for (let i = 0; i < e.target.files.length; i++) {
      const file = e.target.files[i];
      
      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "File too large",
          description: `The file ${file.name} exceeds the 10MB limit`,
          variant: "destructive"
        });
        continue;
      }
      
      // Check file format
      if (!ACCEPTED_FORMATS.includes(file.type)) {
        toast({
          title: "Invalid format",
          description: `The file ${file.name} is not a valid image`,
          variant: "destructive"
        });
        continue;
      }
      
      // Add to selected files
      newFiles.push(file);
      
      // Create preview if needed
      if (showPreview) {
        const promise = new Promise<void>((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            if (e.target?.result) {
              newPreviews.push(e.target.result as string);
            }
            resolve();
          };
          reader.readAsDataURL(file);
        });
        promises.push(promise);
      }
      
      // Respect max images limit
      if (newFiles.length >= maxImages) break;
    }
    
    // Wait for all previews to be generated
    Promise.all(promises).then(() => {
      setSelectedFiles(newFiles);
      if (showPreview) setPreviews(newPreviews);
    });
    
    // Clear input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
    
    if (showPreview) {
      const newPreviews = [...previews];
      newPreviews.splice(index, 1);
      setPreviews(newPreviews);
    }
  };

  // Local-only "upload" (simulate upload, no API calls)
  const uploadFiles = async () => {
    if (!selectedFiles.length) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        // Simulate upload delay
        await new Promise((res) => setTimeout(res, 400));
        setUploadProgress(Math.round(((i + 1) / selectedFiles.length) * 100));
        // Generate data URL for preview (simulate returned URL)
        const reader = new FileReader();
        const url: string = await new Promise((resolve) => {
          reader.onload = (e) => resolve(e.target?.result as string);
          reader.readAsDataURL(file);
        });
        uploadedUrls.push(url);
        if (onImageUploaded) {
          onImageUploaded(url, url, url);
        }
      }
      setUploadedImageUrls(uploadedUrls);
      toast({
        title: "Upload complete",
        description: `${uploadedUrls.length} ${uploadedUrls.length === 1 ? 'image uploaded' : 'images uploaded'} successfully`
      });
      setSelectedFiles([]);
      setPreviews([]);
    } catch (error) {
      toast({
        title: "Upload error",
        description: `Could not upload images: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  return (
    <div className={`image-uploader ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple={allowMultiple}
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        aria-label="Image selection"
      />
      
      {/* Selected image previews */}
      {showPreview && (
        <div className="flex flex-wrap gap-3 mt-3">
          {previews.map((preview, index) => (
            <div 
              key={index} 
              className="relative rounded-lg border border-gray-200 overflow-hidden"
              style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
            >
              <img
                src={preview}
                alt={`Preview ${index}`}
                className="w-full h-full object-cover"
              />
              <button 
                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 transition-colors"
                onClick={() => removeFile(index)}
                aria-label="Remove image"
                type="button"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          ))}
          
          {/* Button to add more images if limit not reached */}
          {previews.length < maxImages && (
            <div 
              className="flex items-center justify-center bg-gray-50 border border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
              style={{ width: `${previewSize}px`, height: `${previewSize}px` }}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="text-center">
                <Camera size={24} className="mx-auto text-gray-400" />
                <span className="text-xs text-gray-500 mt-1 block">
                  {buttonText}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Buttons */}
      <div className="flex space-x-2 items-center mt-4">
        {(!showPreview || previews.length === 0) && (
          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center rounded-full w-full sm:w-auto justify-center"
            disabled={isUploading}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {buttonText}
          </Button>
        )}
        
        {selectedFiles.length > 0 && (
          <Button
            type="button"
            variant="default"
            onClick={uploadFiles}
            disabled={isUploading}
            className="flex items-center bg-primary hover:bg-primary/90 text-white rounded-full w-full sm:w-auto justify-center"
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {`Uploading... ${uploadProgress}%`}
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Upload {selectedFiles.length > 1 ? `${selectedFiles.length} images` : 'image'}
              </>
            )}
          </Button>
        )}
      </div>
      
      {/* Progress indicator */}
      {isUploading && (
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-3">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-300 ease-in-out" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}
    </div>
  );
}