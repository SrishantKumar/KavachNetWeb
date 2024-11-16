import React from 'react';
import { Download as DownloadIcon, Chrome, Smartphone } from 'lucide-react';

const Download = () => {
  const downloads = [
    {
      title: 'Chrome Extension',
      description: 'Download the Chrome Extension for quick access to encryption/decryption right in your browser.',
      icon: Chrome,
      link: 'https://github.com/SrishantKumar/KavachNet-ChromeExtension/releases/download/KavachNetChromeExtension/Net.-.Extension.zip'
    },
    {
      title: 'Android App',
      description: 'Get the Android App for seamless decryption anywhere, anytime.',
      icon: Smartphone,
      link: 'https://github.com/SrishantKumar/KavachNet/releases/download/KavachNet-v0.1/Net.apk'
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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
                  <p className="text-gray-300 mb-6">{item.description}</p>
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
      </div>
    </section>
  );
};

export default Download;
