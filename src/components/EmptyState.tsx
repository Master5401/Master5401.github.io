import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { UserPlus, Activity } from "lucide-react";

interface EmptyStateProps {
  onAddMember: () => void;
}

const EmptyState = ({ onAddMember }: EmptyStateProps) => {
  return (
    <Card className="max-w-2xl mx-auto p-12 text-center shadow-elevated">
      <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-6">
        <Activity className="w-10 h-10 text-primary-foreground" />
      </div>
      <h2 className="text-2xl font-bold mb-3">Welcome to Health Guardian</h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto">
        Start monitoring your loved ones' health by adding your first family member.
        Track their vitals in real-time and get AI-powered health insights.
      </p>
      <Button size="lg" onClick={onAddMember} className="gap-2">
        <UserPlus className="w-5 h-5" />
        Add Your First Member
      </Button>
    </Card>
  );
};

export default EmptyState;