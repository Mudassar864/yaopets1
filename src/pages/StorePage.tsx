import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Store, ArrowLeft } from "lucide-react";

export default function StorePage() {
  const [, setLocation] = useLocation();

  const handleBack = () => {
    setLocation('/');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header with back button */}
      <div className="sticky top-0 z-10 bg-white border-b border-neutral-200">
        <div className="px-4 py-3 flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleBack} 
            className="mr-2"
          >
            <ArrowLeft size={24} />
          </Button>
          <h1 className="text-xl font-bold font-display text-neutral-900">Petshop</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-col items-center justify-center p-8 text-center h-[80vh]">
        <div className="mb-6 p-4 bg-primary/10 rounded-full">
          <Store size={64} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Coming Soon!</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          Our online store is being prepared with special products for your pet.
          Stay tuned for updates and exclusive offers!
        </p>
        <Button onClick={handleBack} className="mt-4">
          Back to home
        </Button>
      </div>
    </div>
  );
}