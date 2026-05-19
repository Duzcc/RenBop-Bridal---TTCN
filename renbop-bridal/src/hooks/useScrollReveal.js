import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook for scroll reveal animations
 * Returns a ref to attach to the element and a boolean indicating visibility
 * 
 * @param {number} threshold - Percentage of element visible before triggering (0-1)
 * @param {string} rootMargin - Margin around the viewport for early triggering
 * @returns {[React.Ref, boolean]} - [ref, isVisible]
 */
export const useScrollReveal = (threshold = 0.1, rootMargin = '0px') => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    // Once visible, stop observing to prevent re-triggering
                    observer.unobserve(entry.target);
                }
            },
            { threshold, rootMargin }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, rootMargin]);

    return [ref, isVisible];
};

/**
 * Hook for elements that should animate IN and OUT on scroll
 * (Re-triggers animation when scrolling back)
 */
export const useScrollRevealRepeating = (threshold = 0.1, rootMargin = '0px') => {
    const ref = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                setIsVisible(entry.isIntersecting);
            },
            { threshold, rootMargin }
        );

        const currentRef = ref.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
        };
    }, [threshold, rootMargin]);

    return [ref, isVisible];
};
