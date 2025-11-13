import { useState, useCallback } from 'react';
import { UploadedImage } from '../types';
import { createImagePreview, validateImageFile, validateImageSize, generateUniqueId } from '../utils/fileUtils';
import { MAX_UPLOAD_IMAGES } from '../constants';

export const useFileUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const addImages = useCallback(async (files: FileList | File[]) => {
    setIsUploading(true);
    
    try {
      const fileArray = Array.from(files);
      const validFiles = fileArray.filter(file => {
        if (!validateImageFile(file)) {
          console.warn(`Unsupported file type: ${file.type}`);
          return false;
        }
        if (!validateImageSize(file)) {
          console.warn(`File too large: ${file.name}`);
          return false;
        }
        return true;
      });

      const newImages: UploadedImage[] = [];
      
      for (const file of validFiles) {
        if (uploadedImages.length + newImages.length >= MAX_UPLOAD_IMAGES) {
          break;
        }
        
        const preview = await createImagePreview(file);
        newImages.push({
          id: generateUniqueId(),
          file,
          preview
        });
      }

      setUploadedImages(prev => [...prev, ...newImages]);
    } catch (error) {
      console.error('Error uploading files:', error);
    } finally {
      setIsUploading(false);
    }
  }, [uploadedImages.length]);

  const removeImage = useCallback((id: string) => {
    setUploadedImages(prev => {
      const image = prev.find(img => img.id === id);
      if (image) {
        URL.revokeObjectURL(image.preview);
      }
      return prev.filter(img => img.id !== id);
    });
  }, []);

  const clearAllImages = useCallback(() => {
    uploadedImages.forEach(image => {
      URL.revokeObjectURL(image.preview);
    });
    setUploadedImages([]);
  }, [uploadedImages]);

  const canAddMore = uploadedImages.length < MAX_UPLOAD_IMAGES;

  return {
    uploadedImages,
    isUploading,
    addImages,
    removeImage,
    clearAllImages,
    canAddMore,
    hasImages: uploadedImages.length > 0
  };
};
