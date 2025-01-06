"use client"

import React, { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import Image from 'next/image'
import { X, Upload } from 'lucide-react'
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { createTask } from '@/services/userTaskService'
import S3MediaFacade from '@/services/mediaService/handle-media'

const formSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters long" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters long" }),
  rewardType: z.enum(['CREDIT', 'POINT']),
  rewardAmount: z.number({ required_error: "Reward amount is required" }).min(1, { message: "Reward amount must be at least 1" }).nullable(),
  taskType: z.enum(['LOCAL', 'CROSS COMMUNITY']),
  taskDifficulty: z.number().min(1).max(5),
  maxParticipants: z.number({ required_error: "Maximum participants is required" }).min(1, { message: "Maximum participants must be at least 1" }).nullable(),
})

interface CreateTaskFormProps {
  communityId: number
  onTaskCreated: () => void
}

export function CreateTaskForm({ communityId, onTaskCreated }: CreateTaskFormProps) {
  const [images, setImages] = useState<File[]>([])
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      rewardType: "CREDIT",
      rewardAmount: null,
      taskType: "LOCAL",
      taskDifficulty: 1,
      maxParticipants: null,
    },
  })

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (images.length + files.length > 5) {
      toast({
        title: "Error",
        description: "You can only upload a maximum of 5 images.",
        variant: "destructive",
      })
      return
    }
    try {
      const uploadedMedias = await S3MediaFacade.uploadMedias(files.map(file => ({ file })))
      const newImageUrls = uploadedMedias.map(media => media.mediaUrl)
      console.log('Uploaded image URLs:', newImageUrls) // Add this line for debugging
      setImages(prevImages => [...prevImages, ...files])
      setImageUrls(prevUrls => [...prevUrls, ...newImageUrls])
    } catch (error) {
      console.error('Error uploading images:', error)
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleImageDelete = async (index: number) => {
    const deletedImageUrl = imageUrls[index]
    try {
      await S3MediaFacade.deleteMedias([deletedImageUrl])
      const newImages = [...images]
      const newImageUrls = [...imageUrls]
      newImages.splice(index, 1)
      newImageUrls.splice(index, 1)
      setImages(newImages)
      setImageUrls(newImageUrls)
    } catch (error) {
      console.error('Error deleting image:', error)
      toast({
        title: "Error",
        description: "Failed to delete image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (values.rewardAmount === null || values.maxParticipants === null) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    try {
      const taskData = {
        communityId,
        ...values,
        taskType: values.taskType.toUpperCase(),
        rewardType: values.rewardType.toUpperCase(),
        rewardAmount: values.rewardAmount,
        maxParticipants: values.maxParticipants,
        mediaList: imageUrls.map(mediaUrl => ({ mediaUrl })),
      }

      console.log('Task data being sent to API:', taskData) // Add this line for debugging

      const response = await createTask(taskData)

      if (response.success) {
        toast({
          title: "Success",
          description: "Task created successfully",
        })
        onTaskCreated()
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create task",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating task:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Task title" {...field} />
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
                <Textarea placeholder="Task description" {...field} className="h-20" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="rewardType"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Reward Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reward type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="CREDIT">Credit</SelectItem>
                    <SelectItem value="POINT">Point</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="rewardAmount"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Reward Amount</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)} 
                    value={field.value ?? ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex space-x-4">
          <FormField
            control={form.control}
            name="taskType"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Task Type</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select task type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="LOCAL">Local</SelectItem>
                    <SelectItem value="CROSS COMMUNITY">Cross Community</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taskDifficulty"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Difficulty</FormLabel>
                <Select onValueChange={(value) => field.onChange(Number(value))} defaultValue={field.value.toString()}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((level) => (
                      <SelectItem key={level} value={level.toString()}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="maxParticipants"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Participants</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  {...field} 
                  onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div>
          <FormLabel>Images (Max 5)</FormLabel>
          <div className="mt-2 flex flex-wrap gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative w-16 h-16">
                <Image src={url} alt={`Uploaded image ${index + 1}`} layout="fill" objectFit="cover" className="rounded-md" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                  onClick={() => handleImageDelete(index)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
            {images.length < 5 && (
              <Button
                type="button"
                variant="outline"
                className="w-16 h-16"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-6 w-6" />
              </Button>
            )}
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            multiple
            className="hidden"
          />
        </div>
        <Button type="submit" className="w-full">Create Task</Button>
      </form>
    </Form>
  )
}

