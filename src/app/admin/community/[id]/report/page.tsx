"use client"

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, ChevronDown } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { generateCommunityReport, CommunityReport } from '@/services/general-community-service/generalCommunityService'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const formSchema = z.object({
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start <= end;
}, {
  message: "Start date must be before or equal to end date",
  path: ["endDate"],
});

const COLORS = ['#ff6b6b', '#4dabf7', '#69db7c', '#ffd43b'];

export default function AdminCommunityReportPage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [report, setReport] = useState<CommunityReport | null>(null)
  const [isOpen, setIsOpen] = useState(true)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      startDate: "",
      endDate: "",
    },
  })

  const handleBack = () => {
    router.push(`/admin/community/${id}`)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (typeof id === 'string') {
      const communityId = parseInt(id, 10)
      try {
        const response = await generateCommunityReport(
          communityId, 
          values.startDate,
          values.endDate
        )
        if (response.success && response.data) {
          setReport(response.data)
          setIsOpen(false)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to generate community report.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error generating community report:', error)
        toast({
          title: "Error",
          description: "An unexpected error occurred while generating the community report.",
          variant: "destructive",
        })
      }
    }
  }

  const calculatePercentages = (report: CommunityReport) => {
    const totalRevenue = report.totalRevenue;
    const managementPercentage = Math.round((report.managementDistribution / totalRevenue) * 100);
    const communityPercentage = Math.round((report.communityMemberDistribution / totalRevenue) * 100);
    const onHoldPercentage = 100 - managementPercentage - communityPercentage;

    return [
      {
        name: 'Total Revenue',
        value: totalRevenue,
        percentage: 100
      },
      {
        name: 'Management',
        value: report.managementDistribution,
        percentage: managementPercentage
      },
      {
        name: 'Community',
        value: report.communityMemberDistribution,
        percentage: communityPercentage
      },
      {
        name: 'On Hold',
        value: totalRevenue - report.managementDistribution - report.communityMemberDistribution,
        percentage: onHoldPercentage
      }
    ];
  };

  const chartData = [
    { name: 'Total', value: report?.totalRevenue || 0 },
    { name: 'Ads', value: report?.advertisementRevenue || 0 },
    { name: 'Tasks', value: report?.taskRevenue || 0 },
    { name: 'Videos', value: report?.videoRevenue || 0 },
  ]

  const activityData = [
    { name: 'Members Joined', value: report?.totalMembersJoined || 0 },
    { name: 'Tasks Created', value: report?.totalTasksCreated || 0 },
    { name: 'Videos Uploaded', value: report?.totalVideosUploaded || 0 },
    { name: 'Ads Uploaded', value: report?.totalAdvertisementsUploaded || 0 },
  ]

  const distributionData = report ? [{
    name: 'Revenue Distribution',
    data: calculatePercentages(report)
  }] : [];

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <button onClick={handleBack} className="mb-4 flex items-center text-gray-600">
          <ArrowLeft className="mr-2" /> Back to Community
        </button>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-bold">Community Report</CardTitle>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "" : "-rotate-180"}`} />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-4">
                      <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Start Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>End Date</FormLabel>
                            <FormControl>
                              <Input 
                                type="date" 
                                {...field} 
                                className="w-full h-10 px-3 py-2 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    {form.formState.errors.endDate && (
                      <p className="text-red-500 text-sm mt-2">{form.formState.errors.endDate.message}</p>
                    )}
                    <Button type="submit" className="w-full mt-4">Generate Report</Button>
                  </form>
                </Form>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {report && (
          <>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Community Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={activityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold">Distribution Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {distributionData[0].data.map((entry, index) => (
                    <div key={entry.name} className="relative">
                      <ResponsiveContainer width="100%" height={200}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: entry.name, value: entry.percentage },
                              { name: 'Remaining', value: 100 - entry.percentage }
                            ]}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={60}
                            startAngle={90}
                            endAngle={-270}
                            dataKey="value"
                          >
                            <Cell fill={COLORS[index]} />
                            <Cell fill="#f1f3f5" />
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-2xl font-bold">{entry.percentage}%</div>
                        <div className="text-sm text-gray-500">{entry.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}

