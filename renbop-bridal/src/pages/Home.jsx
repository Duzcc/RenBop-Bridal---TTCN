import React from 'react';
import HeroLuxury from '../components/home/HeroLuxury';
import BrandPhilosophy from '../components/home/BrandPhilosophy';
import FeaturedCollectionsLuxury from '../components/home/FeaturedCollectionsLuxury';
import TestimonialsLuxury from '../components/home/TestimonialsLuxury';
import { motion } from 'framer-motion';

const Home = () => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full"
        >
            <HeroLuxury />
            <BrandPhilosophy />
            <FeaturedCollectionsLuxury />
            <TestimonialsLuxury />
        </motion.div>
    );
};

export default Home;
