import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp } from "lucide-react";
import { Member } from "@/pages/Dashboard";
import { cn } from "@/lib/utils";

interface MemberCardProps {
  member: Member;
  isSelected: boolean;
  onClick: () => void;
}

const MemberCard = ({ member, isSelected, onClick }: MemberCardProps) => {
  const isAlert = member.status === "Alert";

  return (
    <Card
      className={cn(
        "p-4 cursor-pointer transition-all hover:shadow-md",
        isSelected && "ring-2 ring-primary shadow-md",
        isAlert && "border-accent"
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-lg">{member.name}</h3>
          <p className="text-sm text-muted-foreground">
            {member.relationship}, {member.age} years
          </p>
        </div>
        <Badge variant={isAlert ? "destructive" : "secondary"}>
          {member.status}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-destructive" />
          <span className="font-medium">{member.heartRate} BPM</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-success" />
          <span className="font-medium">{member.steps.toLocaleString()} steps</span>
        </div>
      </div>
    </Card>
  );
};

export default MemberCard;