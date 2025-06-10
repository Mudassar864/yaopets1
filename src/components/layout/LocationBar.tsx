import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useGeoLocation } from "@/hooks/useGeoLocation";

export default function LocationBar() {
  const [location, setLocation] = useState("São Paulo, SP");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newLocation, setNewLocation] = useState("");
  const { getCurrentPosition, position, loading } = useGeoLocation();

  const handleUseCurrentLocation = () => {
    getCurrentPosition();
  };

  const handleSaveLocation = () => {
    if (position?.address) {
      setLocation(position.address);
      setDialogOpen(false);
    } else if (newLocation) {
      setLocation(newLocation);
      setDialogOpen(false);
    }
  };

  return (
    <>
      <div className="bg-neutral-50 px-4 py-2 flex items-center justify-between border-b border-neutral-200">
        <div className="flex items-center text-sm text-neutral-600">
          <span className="material-icons text-sm mr-1">location_on</span>
          <span>{location}</span>
        </div>
        <button 
          className="text-primary text-sm font-medium"
          onClick={() => setDialogOpen(true)}
        >
          Change
        </button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Location</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter your city"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />
            </div>
            
            <div className="flex justify-center">
              <span className="text-sm text-neutral-500">or</span>
            </div>
            
            <Button 
              onClick={handleUseCurrentLocation} 
              variant="outline" 
              className="w-full"
              disabled={loading}
            >
              <span className="material-icons mr-2 text-sm">my_location</span>
              {loading ? "Getting location..." : "Use my current location"}
            </Button>
            
            {position?.address && (
              <div className="text-sm text-green-600 flex items-center">
                <span className="material-icons mr-1 text-sm">check_circle</span>
                Location found: {position.address}
              </div>
            )}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => setDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSaveLocation}
              disabled={!newLocation && !position?.address}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}