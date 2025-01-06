import { Home, Users, User, DollarSign ,MonitorCheck} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface BottomNavProps {
  setCurrentPage: (page: string) => void
  currentPage: string
}

export default function BottomNav({ setCurrentPage, currentPage }: BottomNavProps) {
  const router = useRouter()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole')
    setUserRole(storedRole)
  }, [])

  const handleNavigation = (page: string) => {
    setCurrentPage(page)
    if (userRole === 'admin' && page === 'community') {
      router.push('/admin/community')
    } else if (userRole === 'investor' && page === 'advertisement') {
      router.push('/investor/advertisement')
    }else if (userRole === 'investor' && page === 'user-ads') {
      router.push('/investor/user-ads')
    } else {
      router.push(`/${page === 'home' ? 'home' : page}`)
    }
  }

  if (userRole === 'investor') {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
        <div className="flex justify-center items-center h-16">
        <button
          onClick={() => handleNavigation("home")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            currentPage === "home" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
          <button
            onClick={() => handleNavigation("advertisement")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              currentPage === "advertisement" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <DollarSign size={24} />
            <span className="text-xs mt-1">Advertisement</span>
          </button>

          <button
            onClick={() => handleNavigation("user-ads")}
            className={`flex flex-col items-center justify-center w-full h-full ${
              currentPage === "user-ads" ? "text-blue-500" : "text-gray-500"
            }`}
          >
            <MonitorCheck size={24} />
            <span className="text-xs mt-1">Your Ad</span>
          </button>

          <button
          onClick={() => handleNavigation("me")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            currentPage === "me" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Me</span>
        </button>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-around items-center h-16">
        <button
          onClick={() => handleNavigation("home")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            currentPage === "home" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Home size={24} />
          <span className="text-xs mt-1">Home</span>
        </button>
        <button
          onClick={() => handleNavigation("community")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            currentPage === "community" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Users size={24} />
          <span className="text-xs mt-1">Community</span>
        </button>
        <button
          onClick={() => handleNavigation("me")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            currentPage === "me" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <User size={24} />
          <span className="text-xs mt-1">Me</span>
        </button>
      </div>
    </nav>
  )
}
