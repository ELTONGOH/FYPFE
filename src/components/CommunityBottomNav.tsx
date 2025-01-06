import React, { useEffect, useState } from 'react'
import { Users, CheckSquare, Video, LogOut } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'

interface CommunityBottomNavProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  isEntered: boolean;
  isMember: boolean;
}

const CommunityBottomNav: React.FC<CommunityBottomNavProps> = ({ activeSection, setActiveSection, isEntered, isMember }) => {
  const router = useRouter()
  const { id: communityId } = useParams()
  const [userRole, setUserRole] = useState<string | null>(null)

  useEffect(() => {
    const storedRole = localStorage.getItem('userRole')
    setUserRole(storedRole)
  }, [])

  const handleNavigation = (section: string) => {
    setActiveSection(section)

    if (section === 'task') {
      if (userRole === 'admin') {
        router.push(`/admin/community/${communityId}/tasks`)
      } else {
        router.push(`/community/${communityId}/tasks`)
      }
    } else if (section === 'video') {
      if (userRole === 'admin') {
        router.push(`/admin/community/${communityId}/videos`)
      } else {
        router.push(`/community/${communityId}/videos`)
      }
    }
  }

  const handleExit = () => {
    router.push('/community')
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
      <div className="flex justify-between items-center h-16">
        <button
          onClick={() => setActiveSection("community")}
          className={`flex flex-col items-center justify-center w-full h-full ${
            activeSection === "community" ? "text-blue-500" : "text-gray-500"
          }`}
        >
          <Users size={24} />
          <span className="text-xs mt-1">Community</span>
        </button>
        {isMember && isEntered && (
          <>
            <button
              onClick={() => handleNavigation("task")}
              className={`flex flex-col items-center justify-center w-full h-full ${
                activeSection === "task" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <CheckSquare size={24} />
              <span className="text-xs mt-1">Task</span>
            </button>
            <button
              onClick={() => handleNavigation("video")}
              className={`flex flex-col items-center justify-center w-full h-full ${
                activeSection === "video" ? "text-blue-500" : "text-gray-500"
              }`}
            >
              <Video size={24} />
              <span className="text-xs mt-1">Video</span>
            </button>
          </>
        )}
        <button
          onClick={handleExit}
          className="flex flex-col items-center justify-center w-full h-full text-red-500"
        >
          <LogOut size={24} />
          <span className="text-xs mt-1">Exit</span>
        </button>
      </div>
    </nav>
  )
}

export default CommunityBottomNav

