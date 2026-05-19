import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Share2, Facebook, Twitter, Linkedin } from 'lucide-react';

const BlogArticle = () => {
    const { slug } = useParams();

    // Mock article data
    const article = {
        title: 'The Art of Modern Bridal: 2025 Collection',
        date: 'October 12, 2024',
        author: 'RenBop Design Team',
        category: 'Collections',
        image: 'https://images.unsplash.com/photo-1594552072238-a2ea1cc37e0?w=1600&h=900&fit=crop',
        content: `
            <p class="first-letter:text-5xl first-letter:font-serif first-letter:float-left first-letter:mr-3 first-letter:mt-[-5px]">
            Renbop Bridal has always stood for the delicate balance between tradition and contemporary design. We believe that the modern bride is not defined by a single silhouette or style, but by her confidence and unique vision.</p>
            
            <p>For the 2025 Collection, titled "Comprehension," we delved deep into the archives of classic couture, studying the techniques of the past to reimagine them for the future. You'll find ethereal Chantilly lace layered over structured corsetry, creating a look that is both romantic and architectural.</p>

            <blockquote class="my-10 pl-6 border-l-2 border-champagne italic text-2xl font-serif text-charcoal/80">
                "We wanted to create gowns that feel like heirlooms from the moment they are worn."
            </blockquote>

            <h3>The Philosophy of Fabric</h3>
            <p>We traveled to Como, Italy and Lyon, France to source the finest textiles. Silk organza, mikado, and soft tulle form the foundation of this collection. The hand-feel is just as important as the visual impact.</p>

            <p>Every bead is hand-sewn, every applique placed with intention. This slow-fashion approach ensures that each gown is a masterpiece of craftsmanship, designed to be cherished for generations.</p>

            <h3>The Modern Silhouette</h3>
            <p>Gone are the days of rigid rules. This season, we embrace fluidity. Detachable sleeves, convertible overskirts, and adjustable necklines allow the bride to transform her look from ceremony to reception seamlessly.</p>
        `
    };

    return (
        <div className="min-h-screen bg-ivory pt-24 pb-24">
            {/* Reading Progress Bar (could add later) */}

            <article className="container-luxury max-w-4xl mx-auto">
                {/* Back Link */}
                <div className="mb-12">
                    <Link to="/blogs/news" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-charcoal transition-colors">
                        <ArrowLeft size={14} /> Back to Journal
                    </Link>
                </div>

                {/* Article Header */}
                <header className="text-center mb-16">
                    <div className="flex items-center justify-center gap-4 text-xs font-bold uppercase tracking-widest text-champagne mb-6">
                        <span>{article.category}</span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                        <span className="text-gray-400">{article.date}</span>
                    </div>
                    <h1 className="font-serif text-4xl md:text-6xl text-charcoal italic leading-tight mb-8">
                        {article.title}
                    </h1>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden">
                            {/* Placeholder avatar */}
                            <div className="w-full h-full bg-charcoal"></div>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-charcoal">By {article.author}</span>
                    </div>
                </header>

                {/* Hero Image */}
                <div className="aspect-[16/9] w-full bg-gray-100 overflow-hidden mb-16 relative">
                    <div className="absolute inset-0 bg-black/5"></div>
                    <img
                        src={article.image}
                        alt={article.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                {/* Content */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Share Sidebar */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-32 flex flex-col gap-6 text-gray-400">
                            <span className="text-[10px] uppercase font-bold tracking-widest rotate-90 origin-left translate-x-3 mb-4">Share</span>
                            <button className="hover:text-charcoal transition-colors"><Facebook size={18} /></button>
                            <button className="hover:text-charcoal transition-colors"><Twitter size={18} /></button>
                            <button className="hover:text-charcoal transition-colors"><Linkedin size={18} /></button>
                            <button className="hover:text-charcoal transition-colors"><Share2 size={18} /></button>
                        </div>
                    </div>

                    {/* Main Text */}
                    <div className="lg:col-span-10 lg:col-start-2">
                        <div
                            className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-normal prose-headings:text-charcoal prose-p:font-sans prose-p:text-gray-600 prose-p:leading-loose prose-a:text-champagne hover:prose-a:text-champagne-dark"
                        >
                            <div dangerouslySetInnerHTML={{ __html: article.content }} />
                        </div>

                        {/* Tags / Footer of Article */}
                        <div className="mt-16 pt-8 border-t border-charcoal/10 flex justify-between items-center">
                            <div className="flex gap-2">
                                <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 text-gray-500">Bridal</span>
                                <span className="text-xs font-bold uppercase tracking-widest bg-gray-100 px-3 py-1 text-gray-500">Fashion</span>
                            </div>
                            <div className="lg:hidden flex gap-4 text-gray-400">
                                <Share2 size={18} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Articles could go here */}
            </article>

            {/* Read Next Section */}
            <div className="bg-white py-24 mt-24 border-t border-charcoal/5">
                <div className="container-luxury">
                    <h3 className="font-serif text-3xl text-center italic mb-12">Read Next</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[1, 2, 3].map((item) => (
                            <div key={item} className="group cursor-pointer">
                                <div className="aspect-[4/3] bg-gray-100 mb-4 overflow-hidden">
                                    <img src={`https://source.unsplash.com/random/800x600?wedding&sig=${item}`} alt="Related" className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" />
                                </div>
                                <h4 className="font-serif text-xl mb-2 group-hover:text-champagne transition-colors">The Guide to Veils</h4>
                                <p className="text-xs text-gray-500 uppercase tracking-widest">Guide</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogArticle;
