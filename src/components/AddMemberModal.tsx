import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Check, Watch } from "lucide-react";
import { toast } from "sonner";

interface AddMemberModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (memberData: any) => void;
}

const AddMemberModal = ({ open, onOpenChange, onAdd }: AddMemberModalProps) => {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    relationship: "",
    healthHistory: "",
  });
  const [isPairing, setIsPairing] = useState(false);
  const [isPaired, setIsPaired] = useState(false);

  const handlePairDevice = async () => {
    setIsPairing(true);
    setTimeout(() => {
      setIsPaired(true);
      setIsPairing(false);
      toast.success("Device paired successfully!");
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPaired) {
      toast.error("Please pair a device first");
      return;
    }

    onAdd({
      ...formData,
      age: parseInt(formData.age),
      deviceId: "FitBand-" + Math.random().toString(36).substr(2, 9),
    });

    setFormData({
      name: "",
      age: "",
      relationship: "",
      healthHistory: "",
    });
    setIsPaired(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Family Member</DialogTitle>
          <DialogDescription>
            Add a new family member to monitor their health
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              placeholder="e.g., Mary Johnson"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="age">Age *</Label>
              <Input
                id="age"
                type="number"
                min="1"
                max="120"
                placeholder="e.g., 78"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="relationship">Relationship *</Label>
              <Input
                id="relationship"
                placeholder="e.g., Mother"
                value={formData.relationship}
                onChange={(e) =>
                  setFormData({ ...formData, relationship: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="healthHistory">Health History *</Label>
            <Textarea
              id="healthHistory"
              placeholder="Any relevant medical conditions, medications, or health concerns..."
              value={formData.healthHistory}
              onChange={(e) =>
                setFormData({ ...formData, healthHistory: e.target.value })
              }
              rows={4}
              required
            />
          </div>

          <div className="space-y-2 p-4 rounded-lg border bg-muted/50">
            <Label className="flex items-center gap-2">
              <Watch className="w-4 h-4" />
              Pair Wearable Device
            </Label>
            {!isPaired ? (
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={handlePairDevice}
                disabled={isPairing}
              >
                {isPairing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching for devices...
                  </>
                ) : (
                  "Start Pairing"
                )}
              </Button>
            ) : (
              <div className="flex items-center gap-2 text-success p-2 bg-success/10 rounded">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">FitBand 5 Connected</span>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={!isPaired}>
              Add Member
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;