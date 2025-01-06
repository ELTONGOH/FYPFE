"use client"

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ArrowLeft } from 'lucide-react'
import Image from 'next/image'
import { fetchExistedLocationRanges, ExistedRange, createCommunity, CreateCommunityRequest } from '@/services/adminCommunityService';

const locations = [
  {
    url: "/images/a.jpg",
    name: "Shah Alam-Ara Damansare",
    areas: [
      { name: "Area A", x: 5, y: 5, width: 45, height: 45 },
      { name: "Area B", x: 55, y: 5, width: 40, height: 45 },
      { name: "Area C", x: 5, y: 55, width: 45, height: 40 },
      { name: "Area D", x: 55, y: 55, width: 40, height: 40 },
    ]
  },
  {
    url: "/images/b.jpg",
    name: "Shah Alam-Elmina",
    areas: [
      { name: "Area A", x: 10, y: 10, width: 35, height: 35 },
      { name: "Area B", x: 50, y: 10, width: 45, height: 35 },
      { name: "Area C", x: 10, y: 50, width: 35, height: 45 },
      { name: "Area D", x: 50, y: 50, width: 45, height: 45 },
    ]
  },
  {
    url: "/images/c.jpg",
    name: "KL-Bukit Jalil",
    areas: [
      { name: "Area A", x: 5, y: 5, width: 55, height: 55 },
      { name: "Area B", x: 65, y: 5, width: 30, height: 30 },
      { name: "Area C", x: 5, y: 65, width: 55, height: 30 },
      { name: "Area D", x: 65, y: 40, width: 30, height: 55 },
    ]
  },
  {
    url: "/images/d.jpg",
    name: "KL Sri Petaling",
    areas: [
      { name: "Area A", x: 5, y: 5, width: 50, height: 50 },
      { name: "Area B", x: 60, y: 5, width: 35, height: 45 },
      { name: "Area C", x: 5, y: 60, width: 45, height: 35 },
      { name: "Area D", x: 55, y: 55, width: 40, height: 40 },
    ]
  }
]

export default function CreateCommunityPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null)
  const [selectedArea, setSelectedArea] = useState<string | null>(null);
  const [communityName, setCommunityName] = useState('')
  const [imageDimensions, setImageDimensions] = useState({ width: 600, height: 400 });
  const [scaleFactor, setScaleFactor] = useState(1);
  const imageRef = useRef<HTMLImageElement>(null);
  const [existedRanges, setExistedRanges] = useState<ExistedRange[]>([]);
  const [step, setStep] = useState(1);
  const [communityDetails, setCommunityDetails] = useState({
    maxParticipation: 300,
    memberSharePercentage: 70,
    managementSharePercentage: 30,
    rewardCommunityPercentage: 60,
    rewardTaskParticipantPercentage: 40,
  });
  const [showSummary, setShowSummary] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const fetchLocationRanges = async (location: string) => {
    try {
      const response = await fetchExistedLocationRanges(location);
      if (response.success) {
        setExistedRanges(response.data || []);
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to fetch existed location ranges",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching existed location ranges:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching existed location ranges",
        variant: "destructive",
      });
    }
  };

  const handleLocationSelect = async (index: number) => {
    setSelectedLocation(index)
    setSelectedArea(null)
    await fetchLocationRanges(locations[index].name)
  }

  const isAreaOverlapping = (area: { x: number, y: number, width: number, height: number }) => {
    if (existedRanges.length === 0) {
      return false; // If the list is null or empty, all areas are available
    }
    return existedRanges.some(range => 
      area.x < range.startX + range.width &&
      area.x + area.width > range.startX &&
      area.y < range.startY + range.height &&
      area.y + area.height > range.startY
    );
  };

  const handleAreaSelect = (areaName: string) => {
    const area = locations[selectedLocation!].areas.find(a => a.name === areaName);
    if (area && isAreaOverlapping(area)) {
      toast({
        title: "Area Unavailable",
        description: "This area overlaps with an existing community",
        variant: "destructive",
      });
      return;
    }

    setSelectedArea(areaName);
    setCommunityName(prevName => {
      const baseName = prevName.split(' - ')[0];
      return `${baseName} - ${locations[selectedLocation!].name} (${areaName})`;
    });
  }

  const handleCreateCommunity = async () => {
    if (!agreedToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions before creating the community.",
        variant: "destructive",
      });
      return;
    }

    const selectedLocationData = locations[selectedLocation!];
    const selectedAreaData = selectedLocationData.areas.find(area => area.name === selectedArea);

    if (!selectedAreaData) {
      toast({
        title: "Error",
        description: "Selected area not found",
        variant: "destructive",
      })
      return
    }

    const communityData: CreateCommunityRequest = {
      ...communityDetails,
      name: communityName,
      location: selectedLocationData.name,
      startX: selectedAreaData.x,
      startY: selectedAreaData.y,
      width: selectedAreaData.width,
      height: selectedAreaData.height,
      adminId: 0,
      memberSharePercentage: communityDetails.memberSharePercentage,
      managementSharePercentage: communityDetails.managementSharePercentage,
      communityPercentage: communityDetails.rewardCommunityPercentage,
      taskParticipantPercentage: communityDetails.rewardTaskParticipantPercentage,
    };

    try {
      const response = await createCommunity(communityData);
      if (response.success) {
        toast({
          title: "Success",
          description: "Community created successfully",
        })
        router.push('/admin/community')
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to create community",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error creating community:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while creating the community",
        variant: "destructive",
      })
    }
  }

  const handleBack = () => {
    router.push('/admin/community')
  }

  useEffect(() => {
    const handleResize = () => {
      if (imageRef.current) {
        const { width, height } = imageRef.current.getBoundingClientRect();
        setImageDimensions({ width, height });
        setScaleFactor(width / 600); // 600 is the original width
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [selectedLocation]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let numValue = value === '' ? 0 : parseFloat(value);
    
    if (name === 'maxParticipation') {
      numValue = Math.max(50, Math.min(300, numValue));
    } else {
      numValue = Math.max(0, Math.min(100, numValue));
    }
    
    setCommunityDetails(prev => {
      const newDetails = { ...prev, [name]: numValue };
      
      if (name === 'memberSharePercentage' || name === 'managementSharePercentage') {
        const otherField = name === 'memberSharePercentage' ? 'managementSharePercentage' : 'memberSharePercentage';
        newDetails[otherField] = Math.max(0, Math.min(100, 100 - numValue));
      } else if (name === 'rewardCommunityPercentage' || name === 'rewardTaskParticipantPercentage') {
        const otherField = name === 'rewardCommunityPercentage' ? 'rewardTaskParticipantPercentage' : 'rewardCommunityPercentage';
        newDetails[otherField] = Math.max(0, Math.min(100, 100 - numValue));
      }
      
      return newDetails;
    });
  };

  const handleShowSummary = () => {
    if (
      communityName &&
      selectedLocation !== null &&
      selectedArea &&
      communityDetails.maxParticipation > 0 &&
      communityDetails.maxParticipation <= 300
    ) {
      setShowSummary(true);
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields correctly before proceeding.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-full sm:max-w-4xl mx-auto p-4">
      <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Create New Community</CardTitle>
          </CardHeader>
          <CardContent>
            {step === 1 ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="communityName">Community Name</Label>
                  <Input
                    id="communityName"
                    value={communityName}
                    onChange={(e) => {
                      if (selectedLocation !== null && selectedArea) {
                        setCommunityName(`${e.target.value} - ${locations[selectedLocation].name} (${selectedArea})`)
                      } else {
                        setCommunityName(e.target.value)
                      }
                    }}
                    placeholder="Enter community name"
                  />
                </div>
                <div>
                  <Label>Select Location</Label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                    {locations.map((location, index) => (
                      <div
                        key={index}
                        className={`relative cursor-pointer ${selectedLocation === index ? 'ring-2 ring-blue-500' : ''}`}
                        onClick={() => handleLocationSelect(index)}
                      >
                        <div className="p-4 border rounded-lg">
                          {location.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                {selectedLocation !== null && (
                  <div>
                    <Label>Select Area</Label>
                    <p className="text-sm text-gray-500 mb-2">
                      Select one area for the community
                    </p>
                    <div className="relative mt-2 overflow-hidden">
                      <Image
                        src={locations[selectedLocation].url}
                        alt={locations[selectedLocation].name}
                        layout="responsive"
                        width={600}
                        height={400}
                        className="object-cover rounded-lg"
                        ref={imageRef}
                      />
                      {locations[selectedLocation].areas.map((area, index) => {
                        const isOverlapping = isAreaOverlapping(area);
                        return (
                          <div
                            key={index}
                            className={`absolute border-2 ${
                              isOverlapping ? 'border-gray-500 bg-gray-500 bg-opacity-50 cursor-not-allowed' :
                              selectedArea === area.name ? 'border-blue-500' : 'border-red-500'
                            } cursor-pointer rounded-lg overflow-hidden`}
                            style={{
                              left: `${area.x}%`,
                              top: `${area.y}%`,
                              width: `${area.width}%`,
                              height: `${area.height}%`,
                            }}
                            onClick={() => !isOverlapping && handleAreaSelect(area.name)}
                          >
                            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-xs">
                              {area.name}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div>
                  <Label>Selected Area:</Label>
                  <div className="mt-2">
                    {selectedArea ? (
                      <span className="inline-block bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {selectedArea}
                      </span>
                    ) : (
                      <span className="text-gray-500">No area selected</span>
                    )}
                  </div>
                </div>
                <Button onClick={() => setStep(2)} disabled={selectedLocation === null || !selectedArea || !communityName}>
                  Next
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="maxParticipation">Max Participation (50-300)</Label>
                  <div className="flex items-center">
                    <Button
                      type="button"
                      onClick={() => {
                        const newValue = Math.max(50, communityDetails.maxParticipation - 10);
                        setCommunityDetails(prev => ({ ...prev, maxParticipation: newValue }));
                      }}
                      disabled={communityDetails.maxParticipation <= 50}
                    >
                      -
                    </Button>
                    <Input
                      id="maxParticipation"
                      name="maxParticipation"
                      type="number"
                      min="50"
                      max="300"
                      step="10"
                      value={communityDetails.maxParticipation}
                      onChange={(e) => {
                        const value = Math.max(50, Math.min(300, parseInt(e.target.value) || 50));
                        setCommunityDetails(prev => ({ ...prev, maxParticipation: value }));
                      }}
                      className="mx-2 text-center"
                    />
                    <Button
                      type="button"
                      onClick={() => {
                        const newValue = Math.min(300, communityDetails.maxParticipation + 10);
                        setCommunityDetails(prev => ({ ...prev, maxParticipation: newValue }));
                      }}
                      disabled={communityDetails.maxParticipation >= 300}
                    >
                      +
                    </Button>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">Set the maximum number of participants for this community (50-300).</p>
                </div>
                <div>
                  <Label htmlFor="memberSharePercentage">Member Share Percentage</Label>
                  <Input
                    id="memberSharePercentage"
                    name="memberSharePercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={communityDetails.memberSharePercentage || ''}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleInputChange({ target: { name: 'memberSharePercentage', value: '0' } } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">Set the percentage of shares for community members. Management share will adjust automatically.</p>
                </div>
                <div>
                  <Label htmlFor="managementSharePercentage">Management Share Percentage</Label>
                  <Input
                    id="managementSharePercentage"
                    name="managementSharePercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={communityDetails.managementSharePercentage || ''}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleInputChange({ target: { name: 'managementSharePercentage', value: '0' } } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">Set the percentage of shares for management. Member share will adjust automatically.</p>
                </div>
                <div>
                  <Label htmlFor="rewardCommunityPercentage">Community Reward Percentage</Label>
                  <Input
                    id="rewardCommunityPercentage"
                    name="rewardCommunityPercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={communityDetails.rewardCommunityPercentage || ''}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleInputChange({ target: { name: 'rewardCommunityPercentage', value: '0' } } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">Set the percentage for community rewards. Task participant percentage will adjust automatically.</p>
                </div>
                <div>
                  <Label htmlFor="rewardTaskParticipantPercentage">Task Participant Reward Percentage</Label>
                  <Input
                    id="rewardTaskParticipantPercentage"
                    name="rewardTaskParticipantPercentage"
                    type="number"
                    step="1"
                    min="0"
                    max="100"
                    value={communityDetails.rewardTaskParticipantPercentage || ''}
                    onChange={handleInputChange}
                    onBlur={(e) => {
                      if (e.target.value === '') {
                        handleInputChange({ target: { name: 'rewardTaskParticipantPercentage', value: '0' } } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                  />
                  <p className="text-sm text-gray-500 mt-1">Set the percentage for task participant rewards. Community percentage will adjust automatically.</p>
                </div>
                <div className="flex justify-between">
                  <Button onClick={() => setStep(1)}>Back</Button>
                  <Button onClick={handleShowSummary}>Review and Create</Button>
                </div>
              </div>
            )}
            {showSummary && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                  <h2 className="text-2xl font-bold mb-4">Community Summary</h2>
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">Selected Area</h3>
                    {selectedLocation !== null && (
                      <div className="relative w-full h-0 pb-[66.67%]">
                        <Image
                          src={locations[selectedLocation].url}
                          alt={locations[selectedLocation].name}
                          layout="fill"
                          objectFit="cover"
                          className="rounded-lg"
                          priority
                        />
                        {locations[selectedLocation].areas.map((area, index) => (
                          area.name === selectedArea && (
                            <div
                              key={index}
                              className="absolute rounded-lg overflow-hidden"
                              style={{
                                left: `${area.x}%`,
                                top: `${area.y}%`,
                                width: `${area.width}%`,
                                height: `${area.height}%`,
                              }}
                            >
                              <div className="absolute inset-0 bg-white opacity-50"></div>
                              <div className="absolute inset-0 border-4 border-blue-500"></div>
                            </div>
                          )
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <p><strong>Name:</strong> {communityName}</p>
                    <p><strong>Location:</strong> {selectedLocation !== null ? locations[selectedLocation].name : ''}</p>
                    <p><strong>Area:</strong> {selectedArea || ''}</p>
                    <p><strong>Max Participation:</strong> {communityDetails.maxParticipation}</p>
                    <p><strong>Member Share:</strong> {communityDetails.memberSharePercentage}%</p>
                    <p><strong>Management Share:</strong> {communityDetails.managementSharePercentage}%</p>
                    <p><strong>Community Reward:</strong> {communityDetails.rewardCommunityPercentage}%</p>
                    <p><strong>Task Participant Reward:</strong> {communityDetails.rewardTaskParticipantPercentage}%</p>
                  </div>
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-2">Administrator Agreement</h3>
                    <div className="bg-gray-100 p-4 rounded-lg mb-4 max-h-40 overflow-y-auto">
                      <p>As an administrator of this environmental management community, I agree to:</p>
                      <ul className="list-disc pl-5 mt-2">
                        <li>Actively promote and support environmental conservation efforts within the community</li>
                        <li>Ensure fair and transparent distribution of rewards for eco-friendly activities</li>
                        <li>Encourage community participation in environmental initiatives and education</li>
                        <li>Maintain accurate records of the community's environmental impact and improvements</li>
                        <li>Facilitate open communication between community members on environmental issues</li>
                        <li>Comply with all local and national environmental regulations</li>
                        <li>Regularly update the community on environmental goals and achievements</li>
                        <li>Responsibly manage community resources for maximum positive environmental impact</li>
                        <li>Protect the privacy and data of community members</li>
                        <li>Lead by example in adopting sustainable practices in daily life</li>
                      </ul>
                    </div>
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="agreeTerms"
                        checked={agreedToTerms}
                        onChange={(e) => setAgreedToTerms(e.target.checked)}
                        className="mr-2"
                      />
                      <label htmlFor="agreeTerms" className="text-sm">
                        I accept the responsibilities of being an administrator for this environmental management community
                      </label>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6">
                    <Button onClick={() => setShowSummary(false)} variant="outline">Back</Button>
                    <Button onClick={handleCreateCommunity} disabled={!agreedToTerms}>
                      Create Community
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

