import { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { LoginForm } from "@/components/login-form"

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Image
            src="/images/e.jpg?height=80&width=80"
            width={80}
            height={80}
            alt="Logo"
            className="rounded-full bg-gray-200"
          />
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-gray-600">
            Enter your username to sign in to your account
          </p>
        </div>
        <LoginForm />
  
        
      </div>
    </div>
  )
}

