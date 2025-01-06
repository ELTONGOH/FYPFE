import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { uploadEducationalVideo, UploadVideoData } from '@/services/userVideoService';
import S3MediaFacade from '@/services/mediaService/handle-media';
import { useToast } from "@/components/ui/use-toast";
import { Label } from "@/components/ui/label";
import { ScrollArea } from './ui/scroll-area';

const VIDEO_CATEGORIES = [
  'Waste Management and Recycling',
  'Renewable Energy and Sustainability',
  'Water Conservation and Protection',
  'Climate Change Awareness',
  'Wildlife and Biodiversity Protection',
  'Sustainable Agriculture and Food Systems',
  'Environmental Policies and Laws',
  'Eco-Friendly Technologies',
  'Disaster Preparedness and Management',
  'Environmental Education for Kids',
] as const;

type VideoCategory = typeof VIDEO_CATEGORIES[number];

const VIDEO_TYPES = ['LOCAL', 'CROSS COMMUNITY'] as const;
type VideoType = typeof VIDEO_TYPES[number];

interface CreateVideoDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (videoData: UploadVideoData) => void;
  communityId: number;
}

export function CreateVideoDialog({ isOpen, onClose, onSubmit, communityId }: CreateVideoDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<VideoCategory | ''>('');
  const [type, setType] = useState<VideoType | ''>('');
  const [fee, setFee] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const { toast } = useToast();

  const handleThumbnailUpload = async (file: File) => {
    try {
      const [uploadedMedia] = await S3MediaFacade.uploadMedias([{ file, type: 'image' }]);
      if (uploadedMedia) {
        setThumbnailUrl(uploadedMedia.mediaUrl);
        toast({
          title: "Success",
          description: "Video image uploaded successfully.",
        });
      } else {
        throw new Error("Failed to upload video image");
      }
    } catch (error) {
      console.error('Error uploading video image:', error);
      toast({
        title: "Error",
        description: "Failed to upload video image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleThumbnailDelete = async () => {
    if (!thumbnailUrl) return;

    try {
      await S3MediaFacade.deleteMedias([thumbnailUrl]);
      setThumbnailUrl('');
      setThumbnailFile(null);
      // Clear the file input
      const fileInput = document.getElementById('videoImage') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
      toast({
        title: "Success",
        description: "Video image deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting video image:', error);
      toast({
        title: "Error",
        description: "Failed to delete video image. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title || !description || !category || !type || !fee || !videoLink || !thumbnailUrl) {
      toast({
        title: "Error",
        description: "Please fill in all fields.",
        variant: "destructive",
      });
      return;
    }

    const videoData: UploadVideoData = {
      communityId,
      title,
      description,
      category,
      fee: parseFloat(fee),
      type: type as 'LOCAL' | 'CROSS COMMUNITY',
      videoImage: thumbnailUrl,
      mediaList: [{ mediaUrl: videoLink }],
    };

  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[300px] p-0">
        <DialogHeader className="p-4 pb-0">
          <DialogTitle>Create New Video</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[80vh] px-4 pb-4">
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Video Description</Label>
              <Textarea
                id="description"
                placeholder="Enter video description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select onValueChange={(value) => setCategory(value as VideoCategory)} required>
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Video Type</Label>
              <Select onValueChange={(value) => setType(value as VideoType)} required>
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {VIDEO_TYPES.map(type => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="fee">Fee</Label>
              <Input
                id="fee"
                type="number"
                placeholder="Enter fee"
                value={fee}
                onChange={(e) => setFee(e.target.value)}
                required
                min="0"
                step="0.01"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoLink">Video Link</Label>
              <Input
                id="videoLink"
                type="url"
                placeholder="Enter video link"
                value={videoLink}
                onChange={(e) => setVideoLink(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="videoImage">Video Image</Label>
              <Input
                id="videoImage"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    setThumbnailFile(file);
                    handleThumbnailUpload(file);
                  }
                }}
                required={!thumbnailUrl}
              />
              {thumbnailUrl && (
                <div className="mt-2 space-y-2">
                  <img src={thumbnailUrl} alt="Video Thumbnail" className="w-full h-24 object-cover rounded" />
                  <Button type="button" onClick={handleThumbnailDelete} variant="destructive" className="w-full">
                    Delete Video Image
                  </Button>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit">Create Video</Button>
            </DialogFooter>
          </form>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

