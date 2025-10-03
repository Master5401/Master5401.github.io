import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart, Activity, TrendingUp, AlertTriangle, RefreshCw, Lightbulb, Loader2 } from "lucide-react";
import { Member } from "@/pages/Dashboard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AlertActionsModal from "./AlertActionsModal";

interface MemberDetailPanelProps {
  member: Member;
  allMembers: Member[];
}

const MemberDetailPanel = ({ member, allMembers }: MemberDetailPanelProps) => {
  const [insights, setInsights] = useState<{ summary: string; recommendation: string } | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const isAlert = member.status === "Alert";

  useEffect(() => {
    fetchInsights();
  }, [member.id]);

  const fetchInsights = async () => {
    setIsLoadingInsights(true);
    try {
      const { data, error } = await supabase.functions.invoke("ai-insights", {
        body: {
          memberData: {
            name: member.name,
            age: member.age,
            relationship: member.relationship,
            healthHistory: member.health_history,
            heartRate: member.heartRate,
            bpSystolic: member.bpSystolic,
            bpDiastolic: member.bpDiastolic,
            steps: member.steps,
          },
        },
      });

      if (error) throw error;
      setInsights(data);
    } catch (error: any) {
      console.error("Failed to fetch insights:", error);
      toast.error("Failed to load AI insights");
    } finally {
      setIsLoadingInsights(false);
    }
  };

  return (
    <div className="space-y-6">
      {isAlert && (
        <Card className="border-accent bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertTriangle className="w-6 h-6 text-accent flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">Action Required</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {member.name}'s heart rate is elevated ({member.heartRate} BPM). Immediate attention may be needed.
                </p>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowAlertModal(true)}
                  className="bg-accent hover:bg-accent/90"
                >
                  View Alert Actions
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl">{member.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              {member.relationship}, {member.age} years old
            </p>
          </div>
          <Badge variant={isAlert ? "destructive" : "secondary"} className="text-sm">
            {member.status}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3">Current Vitals</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Heart className="w-8 h-8 text-destructive" />
                <div>
                  <p className="text-2xl font-bold">{member.heartRate}</p>
                  <p className="text-xs text-muted-foreground">BPM</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Activity className="w-8 h-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">
                    {member.bpSystolic}/{member.bpDiastolic}
                  </p>
                  <p className="text-xs text-muted-foreground">Blood Pressure</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <TrendingUp className="w-8 h-8 text-success" />
                <div>
                  <p className="text-2xl font-bold">{member.steps.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Steps Today</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Lightbulb className="w-4 h-4" />
                AI Health Insights
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={fetchInsights}
                disabled={isLoadingInsights}
              >
                <RefreshCw className={`w-4 h-4 ${isLoadingInsights ? "animate-spin" : ""}`} />
              </Button>
            </div>

            {isLoadingInsights ? (
              <div className="flex items-center justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : insights ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-info/10 border border-info/20">
                  <h4 className="font-semibold mb-2 text-sm">Summary</h4>
                  <p className="text-sm text-foreground/90">{insights.summary}</p>
                </div>
                <div className="p-4 rounded-lg bg-success/10 border border-success/20">
                  <h4 className="font-semibold mb-2 text-sm">Recommendation</h4>
                  <p className="text-sm text-foreground/90">{insights.recommendation}</p>
                </div>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                <p className="text-sm">Click refresh to load AI insights</p>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Health History</h3>
            <p className="text-sm text-foreground/80 leading-relaxed">{member.health_history}</p>
          </div>
        </CardContent>
      </Card>

      <AlertActionsModal
        open={showAlertModal}
        onOpenChange={setShowAlertModal}
        memberName={member.name}
      />
    </div>
  );
};

export default MemberDetailPanel;