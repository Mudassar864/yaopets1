import React from 'react';
import { Button } from "@/components/ui/button";
import { useLocation } from 'wouter';

const YaoPetsLanding = () => {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 to-primary/10">
      {/* Header */}
      <header className="py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold font-display text-primary">YaoPets</h1>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline"
            onClick={() => navigate('/auth/login')}
          >
            Sign In
          </Button>
          <Button 
            onClick={() => navigate('/auth/register')}
          >
            Sign Up
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-12">
        <div className="md:w-1/2 space-y-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-neutral-900">
            Connecting <span className="text-primary">people</span> and <span className="text-primary">animals</span> with love
          </h2>
          <p className="text-lg text-neutral-600 max-w-lg">
            A safe space for adoption, donation, veterinary help and much more for all pet lovers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={() => navigate('/auth/register')}
              className="px-8"
            >
              Get Started
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/about')}
              className="px-8"
            >
              Learn More
            </Button>
          </div>
        </div>
        <div className="md:w-1/2">
          <img 
            src="https://source.unsplash.com/random/800x600?pet,dog,cat" 
            alt="Happy pets" 
            className="rounded-2xl shadow-xl w-full h-auto object-cover"
          />
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <h3 className="text-3xl font-bold text-center mb-16">How YaoPets can help you</h3>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary">pets</span>
            </div>
            <h4 className="text-xl font-semibold mb-3">Responsible Adoption</h4>
            <p className="text-neutral-600">
              Find the perfect pet for your family or help rescued animals find a home.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary">local_hospital</span>
            </div>
            <h4 className="text-xl font-semibold mb-3">Veterinary Assistance</h4>
            <p className="text-neutral-600">
              We connect volunteer and professional veterinarians to help pets in need.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary">favorite</span>
            </div>
            <h4 className="text-xl font-semibold mb-3">Donations & Campaigns</h4>
            <p className="text-neutral-600">
              Contribute to campaigns for treatment, surgery, and medications for animals in need.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary">chat</span>
            </div>
            <h4 className="text-xl font-semibold mb-3">Active Community</h4>
            <p className="text-neutral-600">
              Share experiences, ask questions, and connect with other animal lovers.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary">map</span>
            </div>
            <h4 className="text-xl font-semibold mb-3">Nearby Location</h4>
            <p className="text-neutral-600">
              Find pets and services near you with our geolocation system.
            </p>
          </div>
          
          <div className="bg-white p-8 rounded-xl shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <span className="material-icons text-primary">emoji_events</span>
            </div>
            <h4 className="text-xl font-semibold mb-3">Gamification</h4>
            <p className="text-neutral-600">
              Gain recognition and rewards for your contributions to the animal community.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-primary/10 py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold mb-6">Ready to make a difference?</h3>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto mb-8">
            Join thousands of people who are already transforming the lives of animals through YaoPets.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/auth/register')}
            className="px-8"
          >
            Get started for free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-100 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="font-bold text-lg mb-4">YaoPets</h5>
              <p className="text-neutral-600">
                Connecting people and animals with love and care since 2023.
              </p>
            </div>
            
            <div>
              <h5 className="font-bold text-lg mb-4">Quick Links</h5>
              <ul className="space-y-2">
                <li><a href="/about" className="text-neutral-600 hover:text-primary">About us</a></li>
                <li><a href="/pets" className="text-neutral-600 hover:text-primary">Adoption</a></li>
                <li><a href="/donations" className="text-neutral-600 hover:text-primary">Donations</a></li>
                <li><a href="/vet-help" className="text-neutral-600 hover:text-primary">Veterinary Help</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-lg mb-4">Legal</h5>
              <ul className="space-y-2">
                <li><a href="/privacy-policy" className="text-neutral-600 hover:text-primary">Privacy Policy</a></li>
                <li><a href="/terms" className="text-neutral-600 hover:text-primary">Terms of Use</a></li>
              </ul>
            </div>
            
            <div>
              <h5 className="font-bold text-lg mb-4">Contact</h5>
              <ul className="space-y-2">
                <li className="text-neutral-600">contact@yaopets.com</li>
                <li className="text-neutral-600">Follow us on social media</li>
                <li className="flex gap-4 mt-2">
                  <a href="#" className="text-neutral-600 hover:text-primary">
                    <span className="material-icons">facebook</span>
                  </a>
                  <a href="#" className="text-neutral-600 hover:text-primary">
                    <span className="material-icons">instagram</span>
                  </a>
                  <a href="#" className="text-neutral-600 hover:text-primary">
                    <span className="material-icons">twitter</span>
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-200 mt-12 pt-8 text-center text-neutral-500">
            <p>© {new Date().getFullYear()} YaoPets. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default YaoPetsLanding;