import React from 'react';
import { motion } from 'framer-motion';

interface FadeInWhenVisibleProps {
    children: React.ReactNode;
}

export const FadeInWhenVisible: React.FC<FadeInWhenVisibleProps> = ({ children }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
        >
            {children}
        </motion.div>
    );
}; 