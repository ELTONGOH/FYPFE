'use client'

import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import S3MediaFacade from '@/services/mediaService/handle-media';
import Image from 'next/image';

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export default function UploadImageForm() {
  const [image, setImage] = useState<{ id: null, type: string | null, mediaUrl: string, createdAt: null, updatedAt: null } | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const mediaInput = [{
      file,
      type: 'Image'
    }];

    try {
      const [uploadedMedia] = await S3MediaFacade.uploadMedias(mediaInput);
      setImage(uploadedMedia);
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

  const handleDeleteImage = async () => {
    if (!image) return;

    try {
      await S3MediaFacade.deleteMedias([image.mediaUrl]);
      setImage(null);
    } catch (error) {
      console.error('Error deleting image:', error);
    }
  };

  return (
    <div className="space-y-4">
      <Input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
      />
      {image && (
        <div className="mt-4">
          <Image
            src={image.mediaUrl}
            alt="Uploaded image"
            width={300}
            height={300}
            className="rounded-lg object-cover"
          />
          <Button onClick={handleDeleteImage} className="mt-2 bg-red-500 hover:bg-red-600 text-white">
            Delete Image
          </Button>
        </div>
      )}
    </div>
  );
}

