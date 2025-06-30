import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { 
  Mic, 
  Mail,
  Calendar, 
  Target, 
  MessageSquare, 
  RotateCcw,
  Star,
  ArrowRight,
  Music,
  CheckCircle,
  Instagram,
  Twitter,
  Linkedin,
  ChevronDown,
  Sparkles,
  Zap,
  Heart,
  Users,
  TrendingUp
} from 'lucide-react';
import { testEmailConnection } from './emailService';
import EmailSignup from './components/EmailSignup';
import FloatingElements from './components/FloatingElements';
import FloatingButtons from './components/FloatingButtons';
import ProgressBar from './components/ProgressBar';

const App = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Scroll to top visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Test connection function
  const testConnection = async () => {
    try {
      const result = await testEmailConnection();
      if (result.success) {
        alert('✅ Connection successful! Email service is working.');
      } else {
        alert(`❌ Connection failed: ${result.error}`);
      }
    } catch (error) {
      alert(`❌ Test failed: ${error.message}`);
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const floatingAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <div className="min-h-screen bg-dark-950 relative overflow-hidden">
      {/* Progress Bar */}
      <ProgressBar scaleX={scaleX} />

      {/* Floating Elements */}
      <FloatingElements mousePosition={mousePosition} />

      {/* Floating Action Buttons */}
      <FloatingButtons 
        onTestConnection={testConnection}
        showScrollTop={showScrollTop}
        onScrollToTop={scrollToTop}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Hero Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80" 
            alt="Stage with dramatic lighting"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-dark-950/90 via-dark-900/80 to-dark-800/70"></div>
        </div>
        
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent"></div>
        
        {/* Enhanced Floating Elements */}
        <motion.div 
          className="absolute top-20 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl"
          variants={floatingAnimation}
          animate="animate"
        />
        <motion.div 
          className="absolute bottom-20 right-10 w-32 h-32 bg-accent-purple/20 rounded-full blur-xl"
          variants={floatingAnimation}
          animate="animate"
        />
        <motion.div 
          className="absolute top-1/2 left-1/4 w-16 h-16 bg-accent-green/20 rounded-full blur-lg"
          variants={floatingAnimation}
          animate="animate"
          transition={{ delay: 2 }}
        />

        <div className="relative z-10 max-w-6xl mx-auto text-center section-padding">
          <motion.div
            initial="initial"
            animate="animate"
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="mb-6">
              <motion.div 
                className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/90 mb-8 cursor-pointer group"
                whileHover={{ scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.15)" }}
                whileTap={{ scale: 0.95 }}
              >
                <Music className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                AI-Powered Booking Platform
                <Sparkles className="w-4 h-4 ml-2 group-hover:animate-pulse" />
              </motion.div>
            </motion.div>

            <motion.h1 
              variants={fadeInUp}
              className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight text-shadow"
            >
              Your AI
              <motion.span 
                className="gradient-text text-glow inline-block"
                animate={{ 
                  backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] 
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {" "}Booking Assistant
              </motion.span>
            </motion.h1>

            <motion.p 
              variants={fadeInUp}
              className="text-xl md:text-2xl text-white/90 mb-12 max-w-3xl mx-auto leading-relaxed text-shadow"
            >
              TheGreenRoom.ai helps independent artists and venues book smarter, faster—with zero spreadsheets or stress.
            </motion.p>

            <motion.div variants={fadeInUp} className="mb-12">
              <EmailSignup 
                onSuccess={(result) => {
                  console.log('Email signup successful:', result);
                }}
                onError={(error) => {
                  console.error('Email signup error:', error);
                }}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-8 text-white/80">
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-5 h-5 text-primary-400" />
                <span>Free to join</span>
              </motion.div>
              <motion.div 
                className="flex items-center gap-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className="w-5 h-5 text-primary-400" />
                <span>No credit card required</span>
              </motion.div>
            </motion.div>

            {/* Scroll Indicator */}
            <motion.div 
              className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ChevronDown className="w-6 h-6 text-white/60" />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className="section-padding bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {[
              { number: "2,000+", label: "Artists", icon: <Music className="w-6 h-6" /> },
              { number: "500+", label: "Venues", icon: <Target className="w-6 h-6" /> },
              { number: "10,000+", label: "Gigs Booked", icon: <Calendar className="w-6 h-6" /> },
              { number: "95%", label: "Success Rate", icon: <TrendingUp className="w-6 h-6" /> }
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center group cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div 
                  className="w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300"
                  whileHover={{ rotate: 5 }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div 
                  className="text-3xl font-bold text-white mb-2"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: index * 0.1 }}
                >
                  {stat.number}
                </motion.div>
                <div className="text-white/70">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced For Artists Section */}
      <section className="section-padding bg-dark-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
              For <span className="gradient-text">Artists</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/70 max-w-2xl mx-auto">
              Focus on your music while AI handles the business side
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Mic className="w-8 h-8" />,
                title: "Smart gig recommendations",
                description: "AI analyzes your music style and suggests venues that match your vibe and audience.",
                color: "from-primary-500 to-accent-purple"
              },
              {
                icon: <Mail className="w-8 h-8" />,
                title: "AI-generated outreach",
                description: "Automated, personalized emails that actually get responses from venue owners.",
                color: "from-accent-green to-accent-blue"
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Smart CRM tracking",
                description: "Never lose track of a venue contact or past gig again. Everything organized automatically.",
                color: "from-accent-purple to-accent-pink"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="card group cursor-pointer relative overflow-hidden"
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4 group-hover:text-primary-400 transition-colors">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{feature.description}</p>
                
                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced For Venues Section */}
      <section className="section-padding">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
              For <span className="gradient-text">Venues</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/70 max-w-2xl mx-auto">
              Discover and book amazing talent without the hassle
            </motion.p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Target className="w-8 h-8" />,
                title: "Find perfect matches",
                description: "Discover local artists who match your venue's vibe, budget, and audience preferences.",
                color: "from-accent-green to-accent-blue"
              },
              {
                icon: <MessageSquare className="w-8 h-8" />,
                title: "Curated gig pitches",
                description: "Receive personalized booking requests in one organized inbox. No more spam or irrelevant emails.",
                color: "from-accent-blue to-accent-purple"
              },
              {
                icon: <RotateCcw className="w-8 h-8" />,
                title: "Easy rebooking",
                description: "Manage all your bookings in one place and easily rebook artists your audience loved.",
                color: "from-accent-purple to-accent-pink"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="card group cursor-pointer relative overflow-hidden"
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: -5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-xl font-semibold mb-4 group-hover:text-accent-green transition-colors">{feature.title}</h3>
                <p className="text-white/70 leading-relaxed group-hover:text-white/90 transition-colors">{feature.description}</p>
                
                {/* Hover effect overlay */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-accent-green/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Demo Section */}
      <section className="section-padding bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
              See it in <span className="gradient-text">Action</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/70 max-w-2xl mx-auto">
              Watch how TheGreenRoom.ai transforms your booking process
            </motion.p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="relative max-w-4xl mx-auto"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <div className="relative bg-dark-800 rounded-2xl overflow-hidden shadow-2xl">
              {/* Mock Interface */}
              <div className="bg-dark-700 p-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="ml-4 text-white/60 text-sm">TheGreenRoom.ai Dashboard</div>
                </div>
              </div>
              
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <motion.div
                    className="space-y-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity }}
                  >
                    <div className="bg-dark-600 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-primary-500 rounded-lg flex items-center justify-center">
                          <Music className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Sarah Chen</div>
                          <div className="text-white/60 text-sm">Indie Folk • Available this weekend</div>
                        </div>
                      </div>
                      <motion.div 
                        className="bg-primary-500/20 border border-primary-500/30 rounded-lg p-3 text-sm"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="text-primary-300 font-medium">AI Match Score: 94%</div>
                        <div className="text-white/70">Perfect fit for your acoustic night</div>
                      </motion.div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="space-y-4"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                  >
                    <div className="bg-dark-600 p-4 rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-8 h-8 bg-accent-green rounded-lg flex items-center justify-center">
                          <Calendar className="w-4 h-4 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-medium">Friday Night Slot</div>
                          <div className="text-white/60 text-sm">8:00 PM • $200-300 budget</div>
                        </div>
                      </div>
                      <motion.div 
                        className="bg-accent-green/20 border border-accent-green/30 rounded-lg p-3 text-sm"
                        animate={{ scale: [1, 1.02, 1] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 }}
                      >
                        <div className="text-accent-green font-medium">3 Perfect Matches Found</div>
                        <div className="text-white/70">Ready to send booking requests</div>
                      </motion.div>
                    </div>
                  </motion.div>
                </div>

                <motion.div 
                  className="mt-8 text-center"
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <div className="inline-flex items-center gap-2 bg-primary-500/20 border border-primary-500/30 rounded-full px-4 py-2 text-primary-300">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-sm font-medium">AI-powered matching in real-time</span>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Social Proof Section */}
      <section className="section-padding bg-dark-900/30">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-center mb-16"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
              Loved by <span className="gradient-text">Musicians</span>
            </motion.h2>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {[
              {
                quote: "TheGreenRoom.ai feels like having a full-time manager in my pocket. I've booked more gigs in the last month than I did all last year.",
                author: "Sarah Chen",
                role: "Indie Folk Artist",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
              },
              {
                quote: "We filled our Friday slot in 10 minutes with TheGreenRoom.ai's request form. The quality of artists we're getting is incredible.",
                author: "Mike Rodriguez",
                role: "Venue Owner, The Basement",
                rating: 5,
                avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="card group cursor-pointer"
                whileHover={{ 
                  scale: 1.02,
                  y: -5,
                  transition: { type: "spring", stiffness: 300, damping: 20 }
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex gap-1 mb-6">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, rotate: -180 }}
                      whileInView={{ scale: 1, rotate: 0 }}
                      transition={{ delay: i * 0.1, type: "spring", stiffness: 200 }}
                    >
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    </motion.div>
                  ))}
                </div>
                <blockquote className="text-lg text-white/90 mb-6 leading-relaxed group-hover:text-white transition-colors">
                  "{testimonial.quote}"
                </blockquote>
                <div className="flex items-center gap-4">
                  <motion.img
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    className="w-12 h-12 rounded-full object-cover"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                <div>
                    <div className="font-semibold text-white group-hover:text-primary-400 transition-colors">{testimonial.author}</div>
                  <div className="text-white/60">{testimonial.role}</div>
                  </div>
                </div>
                
                {/* Hover effect */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"
                  initial={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Waitlist CTA Section */}
      <section className="section-padding relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(34, 197, 94, 0.3) 0%, transparent 50%),
                              radial-gradient(circle at 75% 75%, rgba(139, 92, 246, 0.3) 0%, transparent 50%)`
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={staggerContainer}
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-display font-bold mb-6">
              Be the first to <span className="gradient-text">book smarter</span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/70 mb-12 max-w-2xl mx-auto">
              Join our early access list and skip the line when we launch. Plus, get exclusive early adopter benefits.
            </motion.p>

            <motion.div variants={fadeInUp} className="mb-8">
              <EmailSignup 
                onSuccess={(result) => {
                  console.log('Email signup successful:', result);
                }}
                onError={(error) => {
                  console.error('Email signup error:', error);
                }}
              />
            </motion.div>

            <motion.div variants={fadeInUp} className="mt-8 text-white/60 text-sm">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Users className="w-4 h-4" />
                <span>Join 2,000+ artists and venues already on the waitlist</span>
              </div>
              <motion.div 
                className="flex items-center justify-center gap-4 text-xs"
                animate={{ opacity: [0.6, 1, 0.6] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3 text-red-400" />
                  Free forever plan
                </span>
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-green-400" />
                  No credit card required
                </span>
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-yellow-400" />
                  Early access benefits
                </span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="border-t border-white/10 bg-dark-900/50">
        <div className="max-w-6xl mx-auto section-padding">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <motion.div 
                className="flex items-center gap-3 mb-6"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <motion.div 
                  className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-purple rounded-xl flex items-center justify-center"
                  whileHover={{ rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Music className="w-6 h-6 text-white" />
                </motion.div>
                <span className="text-2xl font-display font-bold">TheGreenRoom.ai</span>
              </motion.div>
              <p className="text-white/70 mb-6 max-w-md">
                The AI-powered booking assistant that helps independent artists and venues connect, book, and grow together.
              </p>
              <div className="flex gap-4">
                {[
                  { icon: <Instagram className="w-5 h-5" />, href: "https://instagram.com" },
                  { icon: <Twitter className="w-5 h-5" />, href: "https://twitter.com" },
                  { icon: <Linkedin className="w-5 h-5" />, href: "https://linkedin.com" }
                ].map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {social.icon}
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-white/70">
                {["For Artists", "For Venues", "Pricing", "Features"].map((item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a href={`#${item.toLowerCase().replace(' ', '-')}`} className="hover:text-white transition-colors">
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-white/70">
                {["About", "Blog", "Careers", "Contact"].map((item, index) => (
                  <motion.li
                    key={index}
                    whileHover={{ x: 5 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <a href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">
                      {item}
                    </a>
                  </motion.li>
                ))}
              </ul>
            </div>
          </div>

          <motion.div 
            className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-white/60 text-sm">
              © 2024 TheGreenRoom.ai. All rights reserved.
            </p>
            <div className="flex gap-6 mt-4 md:mt-0">
              {["Privacy Policy", "Terms of Service"].map((item, index) => (
                <motion.a
                  key={index}
                  href={`#${item.toLowerCase().replace(' ', '-')}`}
                  className="text-white/60 hover:text-white text-sm transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {item}
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      </footer>
    </div>
  );
};

export default App; 