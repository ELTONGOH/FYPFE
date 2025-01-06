"use client"

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useToast } from "@/components/ui/use-toast"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { submitQuestionnaire } from '@/services/questionnaireService'

interface Question {
  id: number;
  text: string;
  category: 'air' | 'water' | 'environmental';
}

const questions: Question[] = [
  { id: 1, text: "How would you rate the air freshness in your community?", category: 'air' },
  { id: 2, text: "How often do you notice unpleasant odors in the air?", category: 'air' },
  { id: 3, text: "How clear is the visibility in your community due to air quality?", category: 'air' },
  { id: 4, text: "How satisfied are you with the cleanliness of the air in your area?", category: 'air' },
  { id: 5, text: "How often do you experience respiratory issues or allergies due to air quality?", category: 'air' },
  { id: 6, text: "How would you rate the taste of drinking water in your community?", category: 'water' },
  { id: 7, text: "How often do you notice water contamination (e.g., color, smell) in your community?", category: 'water' },
  { id: 8, text: "How reliable is the water supply in your area?", category: 'water' },
  { id: 9, text: "How satisfied are you with the cleanliness of public water sources?", category: 'water' },
  { id: 10, text: "How safe do you feel consuming the tap water in your community?", category: 'water' },
  { id: 11, text: "How clean is the overall environment in your community (e.g., streets, parks)?", category: 'environmental' },
  { id: 12, text: "How often do you see litter or waste in public spaces?", category: 'environmental' },
  { id: 13, text: "How satisfied are you with the availability of green spaces and parks in your community?", category: 'environmental' },
  { id: 14, text: "How effective is waste management (e.g., garbage collection) in your area?", category: 'environmental' },
  { id: 15, text: "How much noise pollution do you experience in your community?", category: 'environmental' },
];

const categories = ['air', 'water', 'environmental'] as const;

export default function QuestionnairePage() {
  const { id } = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [answers, setAnswers] = useState<{ [key: number]: number }>({})
  const [currentCategory, setCurrentCategory] = useState<typeof categories[number]>('air')
  const [averageScores, setAverageScores] = useState<{ [key in typeof categories[number]]: number }>({
    air: 0,
    water: 0,
    environmental: 0,
  })

  useEffect(() => {
    calculateAverageScores()
  }, [answers])

  const handleBack = () => {
    router.push(`/community/${id}?status=MEMBER`)
  }

  const handleAnswerChange = (questionId: number, value: number[]) => {
    setAnswers(prev => ({ ...prev, [questionId]: value[0] }))
  }

  const calculateAverageScores = () => {
    const newAverageScores = { air: 0, water: 0, environmental: 0 };
    let counts = { air: 0, water: 0, environmental: 0 };

    Object.entries(answers).forEach(([questionId, score]) => {
      const question = questions.find(q => q.id === parseInt(questionId));
      if (question) {
        newAverageScores[question.category] += score;
        counts[question.category]++;
      }
    });

    categories.forEach(category => {
      if (counts[category] > 0) {
        newAverageScores[category] = newAverageScores[category] / counts[category];
      }
    });

    setAverageScores(newAverageScores);
  }

  const handleNextCategory = () => {
    const currentIndex = categories.indexOf(currentCategory)
    if (currentIndex < categories.length - 1) {
      setCurrentCategory(categories[currentIndex + 1])
      scrollToTop()
    }
  }

  const handlePreviousCategory = () => {
    const currentIndex = categories.indexOf(currentCategory)
    if (currentIndex > 0) {
      setCurrentCategory(categories[currentIndex - 1])
      scrollToTop()
    }
  }

  const isCurrentCategoryComplete = () => {
    const categoryQuestions = questions.filter(q => q.category === currentCategory)
    return categoryQuestions.every(q => answers[q.id] !== undefined)
  }

  const handleSubmit = async () => {
    if (Object.keys(answers).length !== questions.length) {
      toast({
        title: "Error",
        description: "Please answer all questions before submitting.",
        variant: "destructive",
      })
      return
    }

    const airQualityScores = questions.filter(q => q.category === 'air').map(q => answers[q.id])
    const waterQualityScores = questions.filter(q => q.category === 'water').map(q => answers[q.id])
    const environmentalScores = questions.filter(q => q.category === 'environmental').map(q => answers[q.id])

    try {
      const response = await submitQuestionnaire(Number(id), airQualityScores, waterQualityScores, environmentalScores)
      if (response.success) {
        toast({
          title: "Success",
          description: "Your answers have been submitted successfully. You've earned 10 points!",
        })
        router.push(`/community/${id}?status=MEMBER`)
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to submit questionnaire. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error submitting questionnaire:', error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const renderQuestionSection = (category: typeof categories[number]) => {
    const categoryQuestions = questions.filter(q => q.category === category)
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{category.charAt(0).toUpperCase() + category.slice(1)} Quality Questions</CardTitle>
        </CardHeader>
        <CardContent>
          {categoryQuestions.map((question) => (
            <div key={question.id} className="mb-6">
              <p className="mb-2">{question.text}</p>
              <div className="flex items-center mb-2">
                <div className="flex-grow mr-4">
                  <Slider
                    min={0}
                    max={10}
                    step={1}
                    value={answers[question.id] !== undefined ? [answers[question.id]] : [0]}
                    onValueChange={(value) => handleAnswerChange(question.id, value)}
                  />
                </div>
                <div className="w-8 text-center font-medium">
                  {answers[question.id] !== undefined ? answers[question.id] : 0}
                </div>
              </div>
              <div className="flex justify-between mt-1 text-sm text-gray-500">
                <span>Very Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          ))}
          <div className="mt-4">
            <p className="font-semibold">Section Average Score: {averageScores[category].toFixed(1)}</p>
            <Progress value={averageScores[category] * 10} className="mt-2" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const renderCategoryNavigation = () => {
    return (
      <div className="flex justify-between items-center mb-4">
        {categories.map((category, index) => (
          <Button
            key={category}
            variant={currentCategory === category ? "default" : "outline"}
            onClick={() => setCurrentCategory(category)}
            className={`flex-1 ${index > 0 ? 'ml-2' : ''}`}
          >
            {category.charAt(0).toUpperCase() + category.slice(1)}
            {isAllQuestionsAnswered(category) ? (
              <span className="ml-2 text-green-500">✓</span>
            ) : (
              <span className="ml-2 text-red-500">!</span>
            )}
          </Button>
        ))}
      </div>
    )
  }

  const isAllQuestionsAnswered = (category: typeof categories[number]) => {
    const categoryQuestions = questions.filter(q => q.category === category)
    return categoryQuestions.every(q => answers[q.id] !== undefined)
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-6">
          <button onClick={handleBack} className="flex items-center text-gray-600">
            <ArrowLeft className="mr-2" /> Back to Community
          </button>
          <h1 className="text-2xl font-bold">Daily Questionnaire</h1>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>

        {renderCategoryNavigation()}

        {renderQuestionSection(currentCategory)}

        <div className="flex justify-between mt-4">
          <Button onClick={handlePreviousCategory} disabled={currentCategory === 'air'}>
            <ArrowLeft className="mr-2" /> Previous
          </Button>
          {currentCategory !== 'environmental' ? (
            <Button onClick={handleNextCategory} disabled={!isCurrentCategoryComplete()}>
              Next <ArrowRight className="ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!isAllQuestionsAnswered('environmental')}>
              Submit
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

