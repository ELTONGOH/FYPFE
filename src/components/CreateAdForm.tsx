"use client"

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { createAdvertisement } from '@/services/investorAdsService'
import S3MediaFacade from '@/services/mediaService/handle-media'
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { X, Upload } from 'lucide-react'
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  type: z.enum(["Non-Profit Ad", "Profit Ad"]),
  uploadDuration: z.number().min(1).max(30),
  fees: z.array(z.object({
    communityId: z.number(),
    fee: z.number().min(0, { message: "Fee must be a positive number" }),
    minFee: z.number(),
  })),
  agreedToTerms: z.boolean().refine(val => val === true, { message: "You must agree to the terms" }),
})

interface CreateAdFormProps {
  selectedCommunities: { id: number; name: string; minFee: number;totalMember:number }[]
  onSuccess: () => void
  userBalance: number
}

export function CreateAdForm({ selectedCommunities, onSuccess, userBalance }: CreateAdFormProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [image, setImage] = useState<File | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [step, setStep] = useState(1)
  const [isProgressPopupOpen, setIsProgressPopupOpen] = useState(false)
  const [creationProgress, setCreationProgress] = useState<{ communityId: number; status: 'waiting' | 'uploading' | 'success' | 'failed' }[]>([])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "Non-Profit Ad",
      uploadDuration: 1,
      fees: selectedCommunities.map(c => ({ communityId: c.id, fee: c.minFee, minFee: c.minFee })),
      agreedToTerms: false,
    },
  })

  useEffect(() => {
    const uploadDuration = form.watch('uploadDuration');
    console.log('Selected Communities:', selectedCommunities);
    console.log('Upload Duration:', uploadDuration);
    
    const newFees = selectedCommunities.map(c => {
      const fee =  c.minFee
      console.log(`Calculating fee for ${c.name}:`, { duration: uploadDuration, minFee: c.minFee, fee });
      return {
        communityId: c.id,
        fee: fee,
        minFee: c.minFee
      };
    });
    
    form.setValue('fees', newFees);
  }, [form, selectedCommunities]);

  const { fields } = useFieldArray({
    control: form.control,
    name: "fees",
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      try {
        // Delete existing image if there is one
        if (imageUrl) {
          await S3MediaFacade.deleteMedias([imageUrl])
        }
        const uploadedMedia = await S3MediaFacade.uploadMedias([{ file }])
        if (uploadedMedia.length > 0) {
          setImage(file)
          setImageUrl(uploadedMedia[0].mediaUrl)
        }
      } catch (error) {
        console.error('Error uploading image:', error)
        toast({
          title: "Error",
          description: "Failed to upload image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const handleImageDelete = async () => {
    if (imageUrl) {
      try {
        await S3MediaFacade.deleteMedias([imageUrl])
        setImage(null)
        setImageUrl(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      } catch (error) {
        console.error('Error deleting image:', error)
        toast({
          title: "Error",
          description: "Failed to delete image. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  const calculateTotalFee = useCallback(() => {
    return form.getValues('fees').reduce((sum, fee) => {
      const community = selectedCommunities.find(c => c.id === fee.communityId);
      const duration = form.getValues('uploadDuration');
      const baseFee = community?.totalMember || 0;
      const calculatedFee = duration * baseFee * 0.1;
      return sum + calculatedFee;
    }, 0);
  }, [form, selectedCommunities]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!image) {
      toast({
        title: "Error",
        description: "Please upload an image for the advertisement.",
        variant: "destructive",
      })
      return
    }

    const totalFee = calculateTotalFee()
    if (totalFee > userBalance) {
      toast({
        title: "Error",
        description: "Insufficient funds. Please top up your wallet.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)
    setIsProgressPopupOpen(true)
    setCreationProgress(selectedCommunities.map(c => ({ communityId: c.id, status: 'waiting' })))

    for (let i = 0; i < selectedCommunities.length; i++) {
      const community = selectedCommunities[i]
      setCreationProgress(prev => prev.map(p => p.communityId === community.id ? { ...p, status: 'uploading' } : p))

      try {
        await new Promise(resolve => setTimeout(resolve, 2000)) // 2-second delay

        const adData = {
          communityId: community.id,
          title: values.title,
          description: values.description,
          type: values.type,
          uploadDuration: values.uploadDuration,
          fee: values.uploadDuration * (selectedCommunities.find(c => c.id === community.id)?.totalMember || 0) * 0.1,
          mediaList: [{ mediaUrl: imageUrl! }],
        }

        const response = await createAdvertisement(adData)

        if (response.success) {
          setCreationProgress(prev => prev.map(p => p.communityId === community.id ? { ...p, status: 'success' } : p))
        } else {
          setCreationProgress(prev => prev.map(p => p.communityId === community.id ? { ...p, status: 'failed' } : p))
          toast({
            title: "Error",
            description: `Failed to create advertisement for ${community.name}: ${response.message}`,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error(`Error creating advertisement for ${community.name}:`, error)
        setCreationProgress(prev => prev.map(p => p.communityId === community.id ? { ...p, status: 'failed' } : p))
        toast({
          title: "Error",
          description: `An unexpected error occurred while creating advertisement for ${community.name}. Please try again.`,
          variant: "destructive",
        })
      }
    }

    setIsSubmitting(false)
    //onSuccess() // Moved to ProgressPopup onClose
  }

  const canProceedToNextStep = form.watch('title') && form.watch('description')

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-h-[60vh] overflow-y-auto pr-4">
        {step === 1 && (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter advertisement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter advertisement description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select ad type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Non-Profit Ad">Non-Profit Ad</SelectItem>
                      <SelectItem value="Profit Ad">Profit Ad</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="uploadDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Duration (days): {field.value}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={30}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div>
              <FormLabel>Advertisement Image</FormLabel>
              <div className="mt-2 flex items-center space-x-4">
                {imageUrl ? (
                  <div className="relative w-32 h-32">
                    <Image src={imageUrl} alt="Uploaded image" layout="fill" objectFit="cover" className="rounded-md" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={handleImageDelete}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </Button>
                )}
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
            </div>
            <Button type="button" onClick={() => setStep(2)} disabled={!canProceedToNextStep}>Next</Button>
          </>
        )}
        {step === 2 && (
          <>
            {fields.map((field, index) => (
              <FormField
                key={field.id}
                control={form.control}
                name={`fees.${index}.fee`}
                render={({ field: feeField }) => (
                  <FormItem>
                    <FormLabel>{`Fee for ${selectedCommunities.find(c => c.id === field.communityId)?.name || 'Unknown Community'}`}</FormLabel>
                    <FormControl>
                      <div className="text-sm font-medium">
                        ${(form.watch('uploadDuration') * (selectedCommunities.find(c => c.id === field.communityId)?.totalMember || 0) * 0.1).toFixed(2)}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <div className="font-semibold text-lg">
              Total Fee: ${calculateTotalFee().toFixed(2)}
            </div>
            {calculateTotalFee() > userBalance && (
              <p className="text-red-500 text-sm">Total fee (${calculateTotalFee().toFixed(2)}) exceeds your wallet balance (${userBalance.toFixed(2)}). Please reduce the upload duration or select fewer communities.</p>
            )}
            <FormField
              control={form.control}
              name="agreedToTerms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      I agree to the terms and conditions for creating advertisements
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <div className="flex justify-between">
              <Button type="button" onClick={() => setStep(1)}>Back</Button>
              <Button 
                type="submit" 
                disabled={isSubmitting || calculateTotalFee() > userBalance || !form.formState.isValid}
              >
                {isSubmitting ? "Creating Advertisement..." : "Create Advertisement"}
              </Button>
            </div>
          </>
        )}
      </form>
      <ProgressPopup
        isOpen={isProgressPopupOpen}
        onClose={() => {
          setIsProgressPopupOpen(false);
          onSuccess();
        }}
        progress={creationProgress}
        communities={selectedCommunities}
      />
    </Form>
  )
}

interface ProgressPopupProps {
  isOpen: boolean;
  onClose: () => void;
  progress: { communityId: number; status: 'waiting' | 'uploading' | 'success' | 'failed' }[];
  communities: { id: number; name: string; minFee: number }[];
}

const ProgressPopup: React.FC<ProgressPopupProps> = ({ isOpen, onClose, progress, communities }) => {
  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Advertisement Creation Progress</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {progress.map((item) => {
            const community = communities.find(c => c.id === item.communityId);
            return (
              <div key={item.communityId} className="flex items-center justify-between">
                <span>{community?.name}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold
                  ${item.status === 'waiting' ? 'bg-gray-200 text-gray-800' :
                    item.status === 'uploading' ? 'bg-blue-200 text-blue-800' :
                    item.status === 'success' ? 'bg-green-200 text-green-800' :
                    'bg-red-200 text-red-800'}`}>
                  {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                </span>
              </div>
            );
          })}
        </div>
        <Button onClick={handleClose}>Close</Button>
      </DialogContent>
    </Dialog>
  );
};

