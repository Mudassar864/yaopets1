import React from 'react';
import { useLocation, Link } from 'wouter';
import { Home, PawPrint, PlusCircle, Heart, Stethoscope, Settings } from 'lucide-react';

/**
 * Bottom navigation component for the YaoPets app (Native style)
 * New design:
 * 1. Home (house)
 * 2. Pets (paw)
 * 3. Center button for creating a post - navigates to create page
 * 4. Donations (heart)
 * 5. Vet & Help (stethoscope)
 * Settings icon appears only on specific pages.
 */
export default function NativeBottomNavigation() {
  const [location] = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-purple-bg flex justify-evenly items-center h-16 px-2 z-50">
      {/* Home */}
      <div className="flex items-center justify-center">
        <Link to="/home" className="text-center">
          <div className="flex items-center justify-center">
            <Home size={28} className={location === '/home' ? 'text-primary' : 'text-dark-purple/70'} />
          </div>
        </Link>
      </div>
      
      {/* Pets */}
      <div className="flex items-center justify-center">
        <Link to="/pets" className="text-center">
          <div className="flex items-center justify-center">
            <PawPrint size={28} className={location === '/pets' ? 'text-primary' : 'text-dark-purple/70'} />
          </div>
        </Link>
      </div>
      
      {/* Center button for creating a post - hidden on specific pages */}
      {location !== '/pets' && location !== '/vet-help' && location !== '/donations' && (
        <div className="flex items-center justify-center">
          <Link to="/create-post" className="text-center">
            <div className="flex items-center justify-center relative">
              <div className="bg-primary rounded-full p-3 shadow-md">
                <PlusCircle size={28} className="text-white" />
              </div>
            </div>
          </Link>
        </div>
      )}
      
      {/* Donations (heart) */}
      <div className="flex items-center justify-center">
        <Link to="/donations" className="text-center">
          <div className="flex items-center justify-center">
            <Heart size={28} className={location === '/donations' ? 'text-primary' : 'text-dark-purple/70'} />
          </div>
        </Link>
      </div>
      
      {/* Vet & Help */}
      <div className="flex items-center justify-center">
        <Link to="/vet-help" className="text-center">
          <div className="flex items-center justify-center">
            <Stethoscope size={28} className={location === '/vet-help' ? 'text-primary' : 'text-dark-purple/70'} />
          </div>
        </Link>
      </div>
      
      {/* Settings icon (only on specific pages) */}
      {(location === '/pets' || location === '/vet-help' || location === '/donations') && (
        <div className="flex items-center justify-center">
          <Link to="/settings" className="text-center">
            <div className="flex items-center justify-center">
              <Settings size={28} className="text-dark-purple/70" />
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}