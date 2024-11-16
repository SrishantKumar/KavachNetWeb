import React, { useState, useRef } from 'react';
import { Mail, MessageSquare, Send, Loader } from 'lucide-react';
import emailjs from '@emailjs/browser';
import { EMAILJS_CONFIG } from '../config/emailjs';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: 'success' | 'error' | null;
    message: string;
  }>({ type: null, message: '' });
  const formRef = useRef<HTMLFormElement>(null);

  const validateForm = () => {
    if (!formData.name.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your name' });
      return false;
    }
    if (!formData.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setSubmitStatus({ type: 'error', message: 'Please enter a valid email address' });
      return false;
    }
    if (!formData.message.trim()) {
      setSubmitStatus({ type: 'error', message: 'Please enter your message' });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ type: null, message: '' });

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      await emailjs.sendForm(
        EMAILJS_CONFIG.serviceId,
        EMAILJS_CONFIG.templateId,
        formRef.current!,
        EMAILJS_CONFIG.publicKey
      );

      setSubmitStatus({
        type: 'success',
        message: 'Thank you for reaching out! We\'ll get back to you soon.'
      });
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: 'Failed to send message. Please try again later.'
      });
    } finally {
      setIsSubmitting(false);
    }
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
                <p className="text-gray-300 group-hover:text-red-500 transition-colors">srishant054@gmail.com</p>
              </div>
              <div className="flex items-center gap-4 group hover:scale-105 transform transition-transform">
                <MessageSquare className="text-red-500 w-6 h-6 group-hover:animate-pulse" />
                <p className="text-gray-300 group-hover:text-red-500 transition-colors">24/7 Support Available</p>
              </div>
            </div>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {submitStatus.message && (
              <div className={`p-4 rounded ${
                submitStatus.type === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
              }`}>
                {submitStatus.message}
              </div>
            )}
            <div>
              <label htmlFor="name" className="block text-red-500 mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="user_name"
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
                name="user_email"
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
                name="message"
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={4}
                className="w-full p-3 bg-gray-900 text-red-500 rounded border border-red-500/30 focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-red-500 text-white rounded hover:bg-red-600 focus:ring-2 focus:ring-red-500/50 transition-all transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
              {isSubmitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default Contact;