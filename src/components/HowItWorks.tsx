import React from 'react';
import { FileText, Cpu, Unlock } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      icon: <FileText className="w-12 h-12" />,
      title: "Input Text",
      description: "Enter your encrypted text in the input field"
    },
    {
      icon: <Cpu className="w-12 h-12" />,
      title: "Choose Method",
      description: "Select manual shift or let our AI auto-decrypt"
    },
    {
      icon: <Unlock className="w-12 h-12" />,
      title: "Get Results",
      description: "Instantly see your decrypted message"
    }
  ];

  return (
    <section id="how-it-works" className="py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-red/5 to-black/0 animate-pulse"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-red-600 animate-gradient">
            How It Works
          </span>
        </h2>

        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center max-w-sm p-6 relative group"
            >
              <div className="text-red-500 mb-6 transform transition-transform group-hover:scale-110 duration-300">
                {step.icon}
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4 group-hover:text-red-500 transition-colors">
                {step.title}
              </h3>
              <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                {step.description}
              </p>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-red-500 text-4xl animate-pulse">
                  →
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;