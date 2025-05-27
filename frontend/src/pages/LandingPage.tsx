import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiUsers, FiMapPin, FiShield, FiClock, FiCheckCircle } from 'react-icons/fi';
import { DonationList } from '../components/donation/DonationList';

interface Donation {
  id: string;
  title: string;
  description: string;
  quantity: string;
  expiryDate: string;
  category: string;
  location: {
    lat: number;
    lng: number;
  };
}

export const LandingPage: React.FC = () => {
    const donationsList: Donation[] = []; // Replace with actual donations data

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                    <div className="absolute inset-0 bg-pattern opacity-40"></div>
                    <div className="absolute inset-0 bg-grid-pattern opacity-20"></div>
                </div>

                {/* Animated background elements */}
                <motion.div
                    className="absolute top-1/4 left-1/4 w-64 h-64 bg-green-200 rounded-full opacity-20 blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.2, 0.3, 0.2],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
                <motion.div
                    className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-200 rounded-full opacity-20 blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8"
                        >
                            <span className="glass-effect px-6 py-2 rounded-full text-sm font-medium inline-block shadow-sm hover:shadow-md transition-all duration-300">
                                🌱 Making a Difference Together
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="text-5xl md:text-7xl font-bold mb-8"
                        >
                            <span className="text-gray-800">Turn Leftovers into</span>
                            <span className="block gradient-text">
                                Lifesavers
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-xl text-gray-600 mb-12 leading-relaxed max-w-2xl mx-auto"
                        >
                            Join our mission to reduce food waste and feed those in need. 
                            Every meal saved is a step towards a better world.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.6 }}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to="/register"
                                className="btn-primary group flex items-center justify-center gap-2"
                            >
                                Get Started
                                <span className="group-hover:translate-x-1 transition-transform">
                                    <FiArrowRight />
                                </span>
                            </Link>
                            <Link
                                to="/about"
                                className="btn-secondary flex items-center justify-center"
                            >
                                Learn More
                            </Link>
                        </motion.div>

                        {/* Stats Section */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8"
                        >
                            {[
                                { number: "1M+", label: "Meals Saved" },
                                { number: "50K+", label: "Donors" },
                                { number: "100K+", label: "Recipients" },
                                { number: "95%", label: "Success Rate" }
                            ].map((stat, index) => (
                                <div key={index} className="glass-effect rounded-xl p-4 text-center">
                                    <div className="text-2xl font-bold gradient-text">{stat.number}</div>
                                    <div className="text-sm text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="section-title"
                        >
                            How It Works
                        </motion.h2>
                        <p className="section-subtitle">
                            Making a difference is easier than you think
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                icon: <FiHeart className="w-6 h-6" />,
                                title: "List Your Donation",
                                description: "Share your surplus food with our community in just a few clicks"
                            },
                            {
                                icon: <FiUsers className="w-6 h-6" />,
                                title: "Quick Matching",
                                description: "We instantly connect your donation with nearby recipients"
                            },
                            {
                                icon: <FiMapPin className="w-6 h-6" />,
                                title: "Make an Impact",
                                description: "Complete the donation and track your contribution"
                            }
                        ].map((feature, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <div className="card group">
                                    <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {feature.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {feature.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-24 bg-gray-50 relative overflow-hidden">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="section-title"
                        >
                            Why Choose Us
                        </motion.h2>
                        <p className="section-subtitle">
                            We make food donation simple, secure, and impactful
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FiShield className="w-6 h-6" />,
                                title: "Verified Users",
                                description: "All donors and recipients are verified for safety and reliability"
                            },
                            {
                                icon: <FiClock className="w-6 h-6" />,
                                title: "Real-time Updates",
                                description: "Get instant notifications about donation matches and status"
                            },
                            {
                                icon: <FiCheckCircle className="w-6 h-6" />,
                                title: "Quality Assured",
                                description: "We ensure all donations meet food safety standards"
                            }
                        ].map((benefit, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: index * 0.2 }}
                            >
                                <div className="card group">
                                    <div className="feature-icon group-hover:scale-110 transition-transform duration-300">
                                        {benefit.icon}
                                    </div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-4">
                                        {benefit.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {benefit.description}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-green-900 to-teal-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-pattern-dots opacity-10"></div>
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="container mx-auto px-4 relative z-10"
                >
                    <div className="max-w-4xl mx-auto text-center">
                        <h2 className="text-4xl font-bold mb-8">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-xl mb-12 text-green-100">
                            Join our community today and help us create a world where no food goes to waste
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register?role=donor"
                                className="bg-white text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-all duration-300 hover:shadow-lg hover:scale-105"
                            >
                                Join as Donor
                            </Link>
                            <Link
                                to="/register?role=recipient"
                                className="bg-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:shadow-lg hover:scale-105 border border-green-700"
                            >
                                Join as Recipient
                            </Link>
                        </div>
                    </div>
                </motion.div>
            </section>

            <DonationList donations={donationsList} />
        </div>
    );
}; 