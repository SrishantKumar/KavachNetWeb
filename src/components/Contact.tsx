import React, { useState } from 'react';
import { Mail, MessageSquare, Send } from 'lucide-react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you'd handle the form submission here
    console.log('Form submitted:', formData);
    alert('Message sent successfully!');
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <section id="contact" className="py-20 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-red-500/5 to-black/0 animate-pulse"></div>
      <div className="max-w-7xl mx-auto relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-red-400 via-red-500 to-red-600 animate-gradient">
            Get in Touch
          </span>
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-white">Contact Information</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-4 group hover:scale-105 transform transition-transform">
                <Mail className="text-red-500 w-6 h-6 group-hover:animate-pulse" />
                <p className="text-gray-300 group-hover:text-red-500 transition-colors">support@kavachnet.com</p>
              </div>
              <div className="flex items-center gap-4 group hover:scale-105 transform transition-transform">
                <MessageSquare className="text-red-500 w-6 h-6 group-hover:animate-pulse" />
                <p className="text-gray-300 group-hover:text-red-500 transition-colors">24/7 Support Available</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-red-500 mb-2">Name</label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-3 bg-gray-900 text-red-500 rounded border border-red-500/30 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-red-500 mb-2">Email</label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full p-3 bg-gray-900 text-red-500 rounded border border-red-500/30 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                required
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-red-500 mb-2">Message</label>
              <textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full p-3 bg-gray-900 text-red-500 rounded border border-red-500/30 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500/50 transition-all transform hover:scale-105"
            >
              <Send className="w-5 h-5" />
              Send Message
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;