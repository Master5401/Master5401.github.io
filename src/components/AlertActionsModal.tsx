import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Phone, Users, Stethoscope } from "lucide-react";
import { toast } from "sonner";

interface AlertActionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberName: string;
}

const AlertActionsModal = ({ open, onOpenChange, memberName }: AlertActionsModalProps) => {
  const handleAction = (action: string) => {
    toast.success(`${action} initiated for ${memberName}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Alert Actions</DialogTitle>
          <DialogDescription>
            Choose an immediate action for {memberName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <Button
            variant="destructive"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => handleAction("Emergency services contacted")}
          >
            <Phone className="w-5 h-5" />
            <div className="text-left">
              <p className="font-semibold">Contact Emergency Services</p>
              <p className="text-xs opacity-90">Call 911 immediately</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => handleAction("Family members notified")}
          >
            <Users className="w-5 h-5" />
            <div className="text-left">
              <p className="font-semibold">Notify Family Members</p>
              <p className="text-xs text-muted-foreground">Send alert to all caregivers</p>
            </div>
          </Button>

          <Button
            variant="outline"
            className="w-full justify-start gap-3 h-auto py-4"
            onClick={() => handleAction("Primary care physician contacted")}
          >
            <Stethoscope className="w-5 h-5" />
            <div className="text-left">
              <p className="font-semibold">Contact Primary Care Physician</p>
              <p className="text-xs text-muted-foreground">Call doctor's office</p>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AlertActionsModal;