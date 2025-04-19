import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiArrowRight } from 'react-icons/fi';
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
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center">
                <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
                    <div className="absolute inset-0 opacity-40"></div>
                </div>

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="mb-8"
                        >
                            <span className="px-6 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium inline-block shadow-sm">
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
                            <span className="block bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                                Lifesavers
                            </span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                            className="text-xl text-gray-600 mb-12 leading-relaxed"
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
                                className="group bg-gradient-to-r from-green-600 to-teal-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                Get Started
                                <span className="group-hover:translate-x-1 transition-transform">
                                    <FiArrowRight />
                                </span>
                            </Link>
                            <Link
                                to="/about"
                                className="px-8 py-4 rounded-full text-lg font-semibold text-gray-600 hover:text-green-600 transition-colors duration-300 flex items-center justify-center"
                            >
                                Learn More
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-3xl mx-auto text-center mb-16">
                        <motion.h2
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="text-4xl font-bold text-gray-800 mb-4"
                        >
                            How It Works
                        </motion.h2>
                        <p className="text-xl text-gray-600">
                            Making a difference is easier than you think
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[
                            {
                                title: "List Your Donation",
                                description: "Share your surplus food with our community in just a few clicks"
                            },
                            {
                                title: "Quick Matching",
                                description: "We instantly connect your donation with nearby recipients"
                            },
                            {
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
                                <div className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300">
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

            {/* CTA Section */}
            <section className="py-24 bg-gradient-to-br from-green-900 to-teal-900 text-white">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="max-w-4xl mx-auto text-center"
                    >
                        <h2 className="text-4xl font-bold mb-8">
                            Ready to Make a Difference?
                        </h2>
                        <p className="text-xl mb-12">
                            Join our community today and help us create a world where no food goes to waste
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                to="/register?role=donor"
                                className="bg-white text-green-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-50 transition-colors duration-300"
                            >
                                Join as Donor
                            </Link>
                            <Link
                                to="/register?role=recipient"
                                className="bg-green-800 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-green-700 transition-colors duration-300"
                            >
                                Join as Recipient
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <DonationList donations={donationsList} />
        </div>
    );
}; 