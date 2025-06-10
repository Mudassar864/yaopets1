import React, { useEffect } from 'react';
import { StatusBar, Style as StatusBarStyle } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';

interface MobileStatusBarProps {
  style?: 'light' | 'dark';
  backgroundColor?: string;
}

/**
 * Component to control the status bar in mobile applications.
 * This component does not render anything visually; it only interacts with the native API.
 */
const MobileStatusBar: React.FC<MobileStatusBarProps> = ({
  style = 'light',
  backgroundColor = '#FFFFFF'
}) => {
  useEffect(() => {
    // Only run on native platforms (Android/iOS)
    if (Capacitor.isNativePlatform()) {
      const setupStatusBar = async () => {
        try {
          // Set the status bar style (light or dark content)
          await StatusBar.setStyle({
            style: style === 'light' ? StatusBarStyle.Light : StatusBarStyle.Dark
          });
          
          // On Android, also set the background color
          if (Capacitor.getPlatform() === 'android') {
            await StatusBar.setBackgroundColor({ color: backgroundColor });
          }
        } catch (error) {
          console.error('Error setting status bar:', error);
        }
      };
      
      setupStatusBar();
    }
  }, [style, backgroundColor]);

  // This component does not render anything visible
  return null;
};

export default MobileStatusBar;