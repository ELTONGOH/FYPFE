import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Community } from "@/services/userCommunityService"
import { Progress } from "@/components/ui/progress"
import { useRouter } from 'next/navigation'
import TwoColorProgressBar from "@/components/TwoColorProgressBar"

const ScoreProgressBar: React.FC<{ label: string; score: number }> = ({ label, score }) => {
  const getColorClass = (score: number) => {
    if (score < 3) return "bg-red-500";
    if (score < 5) return "bg-orange-500";
    if (score < 7) return "bg-yellow-500";
    return "bg-green-500";
  };

  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm font-medium">{score.toFixed(1)}</span>
      </div>
      <Progress
        value={score * 10}
        className={`h-2 ${getColorClass(score)}`}
      />
    </div>
  );
};

interface CommunityCardProps {
  community: Community;
  isAdmin?: boolean;
  isAvailable?: boolean;
  onManage?: () => void;
  onJoin?: () => void;
}

const CommunityCard: React.FC<CommunityCardProps> = ({ community, isAdmin = false, isAvailable = false, onManage, onJoin }) => {
  const router = useRouter()
  const hasScores = 
    (community.questionnaireScores?.airQualityScore && community.questionnaireScores.airQualityScore > 0) ||
    (community.questionnaireScores?.waterQualityScore && community.questionnaireScores.waterQualityScore > 0) ||
    (community.questionnaireScores?.environmentalScore && community.questionnaireScores.environmentalScore > 0);

  const handleCommunityAction = () => {
    if (isAdmin && onManage) {
      onManage();
    } else {
      const status = community.membershipStatus || 'NOT_MEMBER';
      const queryParams = new URLSearchParams({
        name: community.name ?? 'Unnamed Community',
        maxParticipation: (community.maxParticipation ?? 0).toString(),
        adminName: community.adminName ?? 'Unknown Admin',
        memberSharePercentage: (community.memberSharePercentage ?? 0).toString(),
        managementSharePercentage: (community.managementSharePercentage ?? 0).toString(),
        rewardCommunityPercentage: (community.rewardDistribution?.communityPercentage ?? 0).toString(),
        rewardTaskParticipantPercentage: (community.rewardDistribution?.taskParticipantPercentage ?? 0).toString(),
        adUserPercentage: (community.advertisementDistribution?.userPercentage ?? 0).toString(),
        adCommunityPercentage: (community.advertisementDistribution?.communityPercentage ?? 0).toString(),
        status: status,
      }).toString();
      router.push(`/community/${community.communityId}?${queryParams}`);
    }
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="text-xl font-bold">{community.name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow">
        <div>
          <p className="font-semibold mb-2">Share Percentages</p>
          <TwoColorProgressBar 
            value1={community.memberSharePercentage}
            value2={community.managementSharePercentage}
            label1="Member"
            label2="Management"
          />
        </div>
        {hasScores && (
          <div className="space-y-2">
            <p className="font-semibold">Scores</p>
            {community.questionnaireScores?.airQualityScore && community.questionnaireScores.airQualityScore > 0 && (
              <ScoreProgressBar label="Air Quality" score={community.questionnaireScores.airQualityScore} />
            )}
            {community.questionnaireScores?.waterQualityScore && community.questionnaireScores.waterQualityScore > 0 && (
              <ScoreProgressBar label="Water Quality" score={community.questionnaireScores.waterQualityScore} />
            )}
            {community.questionnaireScores?.environmentalScore && community.questionnaireScores.environmentalScore > 0 && (
              <ScoreProgressBar label="Environmental" score={community.questionnaireScores.environmentalScore} />
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
  {isAvailable ? (
     <>
     <Button 
       className="w-full" 
       onClick={(e) => {
         e.stopPropagation();
         if (onJoin) onJoin();
       }}
     >
       Join Community
     </Button>
     <Button 
       className="w-full" 
       variant="outline"
       onClick={handleCommunityAction}
     >
       View Details
     </Button>
   </>
    
  ) : (
    <Button 
      className="w-full" 
      onClick={handleCommunityAction}
    >
      {isAdmin 
        ? 'Manage Community' 
        : community.membershipStatus === 'MEMBER' 
          ? 'Enter Community' 
          : 'View Community'}
    </Button>
  )}
</CardFooter>
    </Card>
  )
}

export default CommunityCard

