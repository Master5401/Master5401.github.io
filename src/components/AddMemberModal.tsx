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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AVAILABLE_DEVICES = [
  { id: "fitband-5", name: "FitBand 5", type: "Smart Band" },
  { id: "healthwatch-pro", name: "HealthWatch Pro", type: "Smartwatch" },
  { id: "vitalmonitor-x", name: "VitalMonitor X", type: "Health Tracker" },
  { id: "pulsetrack-elite", name: "PulseTrack Elite", type: "Fitness Tracker" },
  { id: "carelink-band", name: "CareLink Band", type: "Medical Device" },
];

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
  const [selectedDevice, setSelectedDevice] = useState<string>("");

  const handlePairDevice = async () => {
    if (!selectedDevice) {
      toast.error("Please select a device first");
      return;
    }
    
    setIsPairing(true);
    setTimeout(() => {
      setIsPaired(true);
      setIsPairing(false);
      const device = AVAILABLE_DEVICES.find(d => d.id === selectedDevice);
      toast.success(`${device?.name} paired successfully!`);
    }, 2500);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPaired) {
      toast.error("Please pair a device first");
      return;
    }

    const device = AVAILABLE_DEVICES.find(d => d.id === selectedDevice);
    onAdd({
      ...formData,
      age: parseInt(formData.age),
      deviceId: `${device?.name}-${Math.random().toString(36).substr(2, 9)}`,
    });

    setFormData({
      name: "",
      age: "",
      relationship: "",
      healthHistory: "",
    });
    setIsPaired(false);
    setSelectedDevice("");
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

          <div className="space-y-3 p-4 rounded-lg border bg-muted/50">
            <Label className="flex items-center gap-2">
              <Watch className="w-4 h-4" />
              Pair Wearable Device
            </Label>
            
            {!isPaired ? (
              <>
                <Select value={selectedDevice} onValueChange={setSelectedDevice}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a device to pair" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_DEVICES.map((device) => (
                      <SelectItem key={device.id} value={device.id}>
                        <div className="flex flex-col">
                          <span className="font-medium">{device.name}</span>
                          <span className="text-xs text-muted-foreground">{device.type}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handlePairDevice}
                  disabled={isPairing || !selectedDevice}
                >
                  {isPairing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Pairing device...
                    </>
                  ) : (
                    "Pair Device"
                  )}
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-success p-2 bg-success/10 rounded">
                <Check className="w-5 h-5" />
                <span className="text-sm font-medium">
                  {AVAILABLE_DEVICES.find(d => d.id === selectedDevice)?.name} Connected
                </span>
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