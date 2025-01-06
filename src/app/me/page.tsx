"use client"

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import BottomNav from "@/components/BottomNav"

interface UserInfo {
  username: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
}

type Role = 'member' | 'admin' | 'investor';

export default function MePage() {
  const router = useRouter()
  const { toast } = useToast()
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [role, setRole] = useState<Role>('member')
  const [currentPage, setCurrentPage] = useState("me")

  useEffect(() => {
    const storedUserInfo = localStorage.getItem('userInfo')
    const storedRole = localStorage.getItem('userRole') as Role | null

    if (storedUserInfo) {
      try {
        const parsedUserInfo = JSON.parse(storedUserInfo)
        setUserInfo(parsedUserInfo)
        if (storedRole) {
          setRole(storedRole)
        }
      } catch (error) {
        console.error('Error parsing user info:', error)
        toast({
          title: "Error",
          description: "Failed to load user information. Please try logging in again.",
          variant: "destructive",
        })
      }
    } else {
      toast({
        title: "Error",
        description: "User information not found. Please log in again.",
        variant: "destructive",
      })
      router.push('/')
    }
  }, [router, toast])

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = event.target.value as Role
    setRole(newRole)
    localStorage.setItem('userRole', newRole)
    toast({
      title: "Role Changed",
      description: `Role will changed to ${newRole} in 1 sec..`,
    })
    setTimeout(() => {
      window.location.reload()
    }, 1500)
  }

  useEffect(() => {
    const checkRoleChange = () => {
      const currentRole = localStorage.getItem('userRole') as Role | null
      if (currentRole && currentRole !== role) {
        setRole(currentRole)
        toast({
          title: "Role Updated",
          description: `Your role has been updated to ${currentRole}.`,
        })
      }
    }

    window.addEventListener('storage', checkRoleChange)

    return () => {
      window.removeEventListener('storage', checkRoleChange)
    }
  }, [role, toast])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('userInfo')
    localStorage.removeItem('userRole')
    toast({
      title: "Success",
      description: "You have been logged out successfully.",
    })
    router.push('/')
  }

  if (!userInfo) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we fetch your information.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-lg mx-auto p-4">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-0">My Profile</h1>
          <div className="flex flex-col items-center space-y-2">
            <select
              value={role}
              onChange={handleRoleChange}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="member">Community Member</option>
              <option value="admin">Community Admin</option>
              <option value="investor">Community Investor</option>
            </select>
            <div className="mt-2 text-sm text-gray-600">
              <p>Changing your role allows you to access different features and views within the community. Please note that this is for demonstration purposes only and does not affect your actual permissions.</p>
            </div>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem label="Username" value={userInfo.username} />
              <InfoItem label="Full Name" value={userInfo.fullName} />
              <InfoItem label="Email" value={userInfo.email} />
              <InfoItem label="Phone Number" value={userInfo.phoneNumber} />
              <InfoItem label="Address" value={userInfo.address} />
              <InfoItem label="Date of Birth" value={userInfo.dateOfBirth} />
            </div>
          </CardContent>
        </Card>

        {role === 'member' && <MemberContent userInfo={userInfo} />}
        {role === 'admin' && <AdminContent userInfo={userInfo} />}
        {role === 'investor' && <InvestorContent userInfo={userInfo} />}
        <div className="mt-6 text-center">
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full sm:w-auto bg-red-500 text-white hover:bg-red-600"
          >
            Logout
          </Button>
        </div>
      </div>
      <BottomNav setCurrentPage={setCurrentPage} currentPage={currentPage} />
    </div>
  )
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value || 'Not provided'}</dd>
    </div>
  )
}

function MemberContent({ userInfo }: { userInfo: UserInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Member Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Here you can view and manage your community activities.</p>
      </CardContent>
    </Card>
  )
}

function AdminContent({ userInfo }: { userInfo: UserInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Community Admin Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Welcome, Admin {userInfo.fullName}!</p>
        <p>Here you can manage community members and settings.</p>
      </CardContent>
    </Card>
  )
}

function InvestorContent({ userInfo }: { userInfo: UserInfo }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Investor Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-2">Welcome, Investor {userInfo.fullName}!</p>
        <p>Here you can view your investment portfolio and community projects.</p>
      </CardContent>
    </Card>
  )
}

