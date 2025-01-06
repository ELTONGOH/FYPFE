"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

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
import { useToast } from "@/components/ui/use-toast"
import { login } from "@/services/publicService"

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Username must be at least 3 characters long.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters long.",
  }),
})

export function LoginForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)

    try {
      const response = await login(values.username, values.password)
  
      if (response.success) {
        localStorage.setItem('accessToken', response.data?.token || '')
        localStorage.setItem('userRole', "member")
        // Store user information
        const userInfo = {
          username: response.data?.username,
          fullName: response.data?.fullName,
          email: response.data?.email,
          phoneNumber: response.data?.phoneNumber,
          address: response.data?.address,
          dateOfBirth: response.data?.dateOfBirth
        }
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        console.log('Stored userInfo:', userInfo) // Debugging log
        toast({
          title: "Success",
          description: "Login Successful.",
        })
        // Delay redirection by 1 second
        setTimeout(() => {
          router.push("/home")
        }, 100)
      } else {
        toast({
          title: "Error",
          description: response.message || "An error occurred during login.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="username"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Username</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Enter your username" 
                  {...field} 
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500 mt-1" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-medium text-gray-700">Password</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="Enter your password"
                  {...field}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
              </FormControl>
              <FormMessage className="text-xs text-red-500 mt-1" />
            </FormItem>
          )}
        />
        <Button 
          type="submit" 
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-gray-800 bg-[#bbff9f] hover:bg-[#a8e68f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#bbff9f]"
          disabled={isLoading}
        >
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="mt-4 text-center">
        <Link href="/signup" className="text-sm text-blue-600 hover:underline">
          Don't have an account? Sign up
        </Link>
      </div>
    </Form>
  )
}

