import React, { useState, useEffect } from 'react';
import { Shield, ShieldCheck, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export type VerificationStatus = {
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  addressVerified: boolean;
  paymentVerified: boolean;
};

type VerifiedSecurityBadgeProps = {
  verificationStatus: VerificationStatus;
  size?: 'sm' | 'md' | 'lg';
  showDetails?: boolean;
  className?: string;
};

const VerifiedSecurityBadge: React.FC<VerifiedSecurityBadgeProps> = ({
  verificationStatus,
  size = 'md',
  showDetails = false,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [verificationLevel, setVerificationLevel] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate verification level based on verified items
  useEffect(() => {
    const verificationItems = Object.values(verificationStatus);
    const verifiedCount = verificationItems.filter(Boolean).length;
    setVerificationLevel(Math.floor((verifiedCount / verificationItems.length) * 100));
  }, [verificationStatus]);

  // Badge size classes
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  // Determine styles based on verification level
  const getVerificationStyle = () => {
    if (verificationLevel >= 100) {
      return {
        bgColor: 'bg-gradient-to-r from-emerald-500 to-emerald-700',
        textColor: 'text-emerald-500',
        borderColor: 'border-emerald-400',
        icon: <ShieldCheck className={`${sizeClasses[size]} text-white`} />,
        label: 'Fully Verified Profile',
      };
    } else if (verificationLevel >= 60) {
      return {
        bgColor: 'bg-gradient-to-r from-blue-500 to-blue-700',
        textColor: 'text-blue-500',
        borderColor: 'border-blue-400',
        icon: <Shield className={`${sizeClasses[size]} text-white`} />,
        label: 'Partially Verified Profile',
      };
    } else {
      return {
        bgColor: 'bg-gradient-to-r from-amber-500 to-amber-700',
        textColor: 'text-amber-500',
        borderColor: 'border-amber-400',
        icon: <ShieldAlert className={`${sizeClasses[size]} text-white`} />,
        label: 'Profile Pending Verification',
      };
    }
  };

  const { bgColor, textColor, borderColor, icon, label } = getVerificationStyle();

  // Start animation on mount
  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // Framer Motion animation variants
  const badgeVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: 'spring',
        stiffness: 260,
        damping: 20,
        duration: 0.5 
      }
    },
    hover: { 
      scale: 1.1,
      boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.3)',
      transition: { 
        type: 'spring',
        stiffness: 400,
        damping: 10
      }
    },
    pulse: {
      scale: [1, 1.05, 1],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatType: 'reverse'
      }
    }
  };

  // Render the verification badge
  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <motion.div
        className={`rounded-full p-1 ${bgColor} shadow-lg cursor-pointer relative`}
        initial="initial"
        animate={isAnimating ? "animate" : verificationLevel === 100 ? "pulse" : "animate"}
        whileHover="hover"
        variants={badgeVariants}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
      >
        {icon}
        
        {verificationLevel === 100 && (
          <motion.div 
            className="absolute inset-0 rounded-full border-2 border-white opacity-30 pointer-events-none"
            animate={{
              scale: [1, 1.4, 1],
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
            }}
          />
        )}
      </motion.div>

      {(showDetails || isHovered) && (
        <motion.div 
          className={`absolute top-full mt-2 w-40 bg-white rounded-md shadow-md p-2 z-10 border ${borderColor}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <div className={`text-sm font-medium mb-1 ${textColor}`}>{label}</div>
          <div className="text-xs text-gray-600 space-y-1">
            <div className="flex justify-between items-center">
              <span>Email</span>
              <span>{verificationStatus.emailVerified ? '✓' : '✗'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Phone</span>
              <span>{verificationStatus.phoneVerified ? '✓' : '✗'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>ID</span>
              <span>{verificationStatus.idVerified ? '✓' : '✗'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Address</span>
              <span>{verificationStatus.addressVerified ? '✓' : '✗'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Payment</span>
              <span>{verificationStatus.paymentVerified ? '✓' : '✗'}</span>
            </div>
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className={`h-full ${bgColor}`}
              style={{ width: `${verificationLevel}%` }}
            />
          </div>
          <div className="text-xs text-right mt-1">{verificationLevel}% verified</div>
        </motion.div>
      )}
    </div>
  );
};

export default VerifiedSecurityBadge;