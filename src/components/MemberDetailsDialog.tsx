import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"

interface CommunityMember {
  userId: number;
  username: string;
  fullName: string;
  email: string;
  effortPercentage: number;
  totalScore: number;
}

interface MemberDetailsDialogProps {
  members: CommunityMember[];
}

const MemberDetailsDialog: React.FC<MemberDetailsDialogProps> = ({ members }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">View Member Details</Button>
      </DialogTrigger>
      <DialogContent className="max-w-[90vw] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Community Members</DialogTitle>
        </DialogHeader>
        <Tabs defaultValue="details" className="w-full">
          <TabsList>
            <TabsTrigger value="details">Member Details</TabsTrigger>
            <TabsTrigger value="effort">Member Effort</TabsTrigger>
          </TabsList>
          <TabsContent value="details">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.userId} className="p-4 border rounded">
                  <h3 className="font-bold">{member.fullName}</h3>
                  <p>{member.email}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          <TabsContent value="effort">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => (
                <div key={member.userId} className="p-4 border rounded">
                  <h3 className="font-bold">{member.fullName}</h3>
                  <div className="mt-2">
                    <p>Effort:</p>
                    <Progress value={member.effortPercentage} className="w-full" />
                    <p className="text-sm text-right">{member.effortPercentage}%</p>
                  </div>
                  <p>Score: {member.totalScore}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default MemberDetailsDialog;

