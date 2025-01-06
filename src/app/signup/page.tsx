"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

import { Button} from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"


import { signup } from "../../services/publicService"

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters long." }),
  password: z.string().min(8, { message: "Password must be at least 8 characters long." }),
  fullName: z.string().min(2, { message: "Full name must be at least 2 characters long." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  phoneNumber: z.string().refine((value) => {
    if (value === '') return true; // Allow empty values
    // Malaysian phone number format: +60xxxxxxxxx or 01xxxxxxxx
    return /^(\+60|0)[1-9]\d{8,9}$/.test(value);
  }, { message: "Please enter a valid Malaysian phone number or leave it empty." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters long." }),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: "Please enter a valid date in YYYY-MM-DD format." }),
})

export default function SignUpPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
      fullName: "",
      email: "",
      phoneNumber: "",
      address: "",
      dateOfBirth: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const response = await signup(values);
      
      console.log("Signup response:", response);

      if (response.success) {
        console.log("Showing success toast");
        toast({
          title: "Success",
          description: response.data?.message || "Your account has been created successfully.",
        })
      
        // Delay redirection by 2 seconds
        setTimeout(() => {
          router.push("/")
        }, 2000)
      } else {
        console.log("Showing failure toast");
        toast({
          title: "Error",
          description: response.data?.message || "An error occurred during sign up.",
          variant: "destructive",
        })
        console.error('Sign up failed:', response);
      }
    } catch (error) {
      console.error('Sign up error:', error);
      console.log("Showing error toast");
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-4">
       
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Create your account
          </h2>
        </div>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your username" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="Enter your email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number (Optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., +60123456789 or 0123456789" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dateOfBirth"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Birth</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-[#bbff9f] hover:bg-[#a8e68f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bbff9f]"
              disabled={isLoading}
            >
              {isLoading ? "Signing up..." : "Sign Up"}
            </Button>
          <Link href="/">
          <Button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-[#a3ae9e] hover:bg-[#a8e68f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bbff9f]"
            >
              Back to Login
            </Button>
          </Link>
          </form>
        </Form>
      </div>
    </div>
  )
}

