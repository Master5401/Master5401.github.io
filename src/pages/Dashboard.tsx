import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Activity, LogOut, Plus, Bot } from "lucide-react";
import { toast } from "sonner";
import MemberCard from "@/components/MemberCard";
import MemberDetailPanel from "@/components/MemberDetailPanel";
import AddMemberModal from "@/components/AddMemberModal";
import HealthAssistant from "@/components/HealthAssistant";
import EmptyState from "@/components/EmptyState";

export interface Member {
  id: string;
  name: string;
  age: number;
  relationship: string;
  health_history: string;
  device_id: string | null;
  status: string;
  heartRate: number;
  bpSystolic: number;
  bpDiastolic: number;
  steps: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (session) {
      loadMembers();
    }
  }, [session]);

  useEffect(() => {
    if (members.length === 0) {
      setIsLoading(false);
      return;
    }

    const interval = setInterval(() => {
      setMembers((prevMembers) =>
        prevMembers.map((member) => {
          const newHeartRate = Math.max(
            60,
            Math.min(100, member.heartRate + (Math.random() - 0.5) * 4)
          );
          const newSteps = member.steps + Math.floor(Math.random() * 15);

          const shouldAlert = Math.random() < 0.05 && newHeartRate > 95;

          return {
            ...member,
            heartRate: Math.round(newHeartRate),
            steps: newSteps,
            status: shouldAlert ? "Alert" : "Normal",
          };
        })
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [members.length]);

  const loadMembers = async () => {
    try {
      const { data, error } = await supabase
        .from("members")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const membersWithVitals: Member[] = (data || []).map((member) => ({
        ...member,
        heartRate: 75 + Math.floor(Math.random() * 10),
        bpSystolic: 120 + Math.floor(Math.random() * 10),
        bpDiastolic: 80 + Math.floor(Math.random() * 5),
        steps: Math.floor(Math.random() * 2000),
      }));

      setMembers(membersWithVitals);
      if (membersWithVitals.length > 0) {
        setSelectedMember(membersWithVitals[0]);
      }
    } catch (error: any) {
      toast.error("Failed to load members");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleAddMember = async (memberData: any) => {
    try {
      const { data, error } = await supabase
        .from("members")
        .insert([
          {
            name: memberData.name,
            age: memberData.age,
            relationship: memberData.relationship,
            health_history: memberData.healthHistory,
            device_id: memberData.deviceId,
            user_id: session?.user.id,
          },
        ])
        .select()
        .single();

      if (error) throw error;

      const newMember: Member = {
        ...data,
        heartRate: 75,
        bpSystolic: 120,
        bpDiastolic: 80,
        steps: 0,
      };

      setMembers([newMember, ...members]);
      setSelectedMember(newMember);
      setIsAddModalOpen(false);
      toast.success(`${memberData.name} added successfully!`);
    } catch (error: any) {
      toast.error("Failed to add member");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-primary mx-auto animate-pulse mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Health Guardian</h1>
              <p className="text-xs text-muted-foreground">Family Health Monitoring</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddModalOpen(true)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Member
            </Button>
            <Button variant="ghost" size="icon" onClick={handleSignOut}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {members.length === 0 ? (
          <EmptyState onAddMember={() => setIsAddModalOpen(true)} />
        ) : (
          <div className="grid lg:grid-cols-[350px_1fr] gap-6">
            <aside className="space-y-4">
              <h2 className="text-lg font-semibold text-foreground">Family Members</h2>
              <div className="space-y-3">
                {members.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    isSelected={selectedMember?.id === member.id}
                    onClick={() => setSelectedMember(member)}
                  />
                ))}
              </div>
            </aside>

            <section>
              {selectedMember && (
                <MemberDetailPanel
                  member={selectedMember}
                  allMembers={members}
                />
              )}
            </section>
          </div>
        )}
      </main>

      <AddMemberModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddMember}
      />

      <HealthAssistant
        open={isAssistantOpen}
        onOpenChange={setIsAssistantOpen}
        members={members}
      />

      <Button
        size="lg"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg"
        onClick={() => setIsAssistantOpen(true)}
      >
        <Bot className="w-6 h-6" />
      </Button>
    </div>
  );
};

export default Dashboard;