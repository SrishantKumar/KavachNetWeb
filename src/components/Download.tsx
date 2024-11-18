import React, { useState } from 'react';
import { Download as DownloadIcon, Chrome, Smartphone, Shield, Users, Award } from 'lucide-react';
import InteractiveDemo from './InteractiveDemo';
import FeatureCarousel from './FeatureCarousel';
import ComparisonTable from './ComparisonTable';

const Download = () => {
  const [downloads, setDownloads] = useState([
    {
      title: 'Chrome Extension',
      description: 'Download the Chrome Extension for quick access to encryption/decryption right in your browser.',
      icon: Chrome,
      link: 'https://github.com/SrishantKumar/KavachNet-ChromeExtension/releases/download/KavachNetChromeExtension/Net.-.Extension.zip',
      downloads: 10000
    },
    {
      title: 'Android App',
      description: 'Get the Android App for seamless decryption anywhere, anytime.',
      icon: Smartphone,
      link: 'https://github.com/SrishantKumar/KavachNet/releases/download/KavachNet-v0.2/KavachNet.apk',
      downloads: 5000
    }
  ]);

  const stats = [
    {
      icon: Shield,
      value: '15,000+',
      label: 'Total Downloads'
    },
    {
      icon: Users,
      value: '1,000+',
      label: 'Active Users'
    },
    {
      icon: Award,
      value: '99.9%',
      label: 'Uptime'
    }
  ];

  return (
    <section id="downloads" className="relative py-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Download Our Tools</h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Get access to our powerful encryption/decryption tools. Choose the platform that suits you!
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-700 mx-auto rounded-full mt-6"></div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-6 text-center"
              >
                <Icon className="w-8 h-8 text-red-500 mx-auto mb-4" />
                <div className="text-2xl font-bold text-white mb-2">{stat.value}</div>
                <div className="text-gray-300">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Interactive Demo */}
        <div className="mb-16">
          <InteractiveDemo />
        </div>

        {/* Feature Carousel */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-8">Key Features</h3>
          <FeatureCarousel />
        </div>

        {/* Download Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
          {downloads.map((item, index) => {
            const Icon = item.icon;
            return (
              <div
                key={index}
                className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 shadow-lg hover:shadow-red-500/20 transition-all duration-300"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-3">{item.title}</h3>
                  <p className="text-gray-300 mb-4">{item.description}</p>
                  <div className="text-sm text-gray-400 mb-6">
                    {item.downloads.toLocaleString()} downloads
                  </div>
                  <a
                    href={item.link}
                    download
                    className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-red-500 to-red-700 text-white font-medium hover:from-red-600 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
                  >
                    <DownloadIcon className="w-5 h-5 mr-2" />
                    Download {item.title}
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div>
          <h3 className="text-2xl font-bold text-white text-center mb-8">Feature Comparison</h3>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10">
            <ComparisonTable />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Download;
