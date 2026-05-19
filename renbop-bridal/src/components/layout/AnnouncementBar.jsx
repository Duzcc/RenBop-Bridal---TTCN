import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AnnouncementBar = () => {
    return (
        <div className="bg-primary text-white py-2 px-4 text-center relative overflow-hidden z-50">
            <Link
                to="/pages/about"
                className="text-xs md:text-sm tracking-wide hover:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
                <span>@RenBop.design 15 NĂM KINH NGHIỆM</span>
                <ArrowRight size={14} />
            </Link>
        </div>
    );
};

export default AnnouncementBar;
