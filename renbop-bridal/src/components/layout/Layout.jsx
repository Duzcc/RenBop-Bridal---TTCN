import React from 'react';
import AnnouncementBar from './AnnouncementBar';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-ivory text-charcoal font-sans selection:bg-champagne/30 selection:text-charcoal">
            <AnnouncementBar />
            <Header />
            <main className="flex-grow pt-20 lg:pt-24"> {/* Added padding-top for fixed header */}
                {children}
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
