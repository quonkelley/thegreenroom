import { motion, useScroll, useSpring } from 'framer-motion';
import {
  Calendar,
  CheckCircle,
  Mail,
  MessageSquare,
  Mic,
  Music,
  RotateCcw,
  Sparkles,
  Star,
  Target,
  TrendingUp,
} from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AnalyticsDashboard from '../components/AnalyticsDashboard';
import FloatingButtons from '../components/FloatingButtons';
import FloatingElements from '../components/FloatingElements';
import ProgressBar from '../components/ProgressBar';
import { testEmailConnection } from '../lib/emailService';

function Home() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Mouse tracking for interactive background
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
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
      alert(
        `❌ Test case failed: ${error instanceof Error ? error.message : 'Unknown error occurred'}`
      );
    }
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const floatingAnimation = {
    animate: {
      y: [0, -20, 0],
      transition: {
        duration: 6,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    },
  };

  return (
    <div className='min-h-screen bg-dark-950 relative overflow-hidden'>
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
      <section className='relative min-h-screen flex items-center justify-center overflow-hidden'>
        {/* Hero Background Image */}
        <div className='absolute inset-0'>
          <Image
            src='https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80'
            alt='Stage with dramatic lighting'
            fill
            className='object-cover'
            priority
          />
          <div className='absolute inset-0 bg-gradient-to-br from-dark-950/90 via-dark-900/80 to-dark-800/70'></div>
        </div>

        {/* Background Effects */}
        <div className='absolute inset-0 bg-gradient-radial from-primary-500/10 via-transparent to-transparent'></div>

        {/* Enhanced Floating Elements */}
        <motion.div
          className='absolute top-20 left-10 w-20 h-20 bg-primary-500/20 rounded-full blur-xl'
          variants={floatingAnimation}
          animate='animate'
        />
        <motion.div
          className='absolute bottom-20 right-10 w-32 h-32 bg-accent-purple/20 rounded-full blur-xl'
          variants={floatingAnimation}
          animate='animate'
        />
        <motion.div
          className='absolute top-1/2 left-1/4 w-16 h-16 bg-accent-green/20 rounded-full blur-lg'
          variants={floatingAnimation}
          animate='animate'
          transition={{ delay: 2 }}
        />

        <div className='relative z-10 max-w-6xl mx-auto text-center px-4 py-20'>
          <motion.div
            initial='initial'
            animate='animate'
            variants={staggerContainer}
          >
            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className='mb-6'
            >
              {/* Logo */}
              <motion.div
                variants={fadeInUp}
                transition={{ duration: 0.8 }}
                className='mb-12'
              >
                <div className='w-48 h-48 md:w-64 md:h-64 mx-auto mb-12 relative'>
                  <Image
                    src='/logo-dark.png'
                    alt='TheGreenRoom.ai Logo'
                    width={256}
                    height={256}
                    className='object-contain'
                  />
                </div>
              </motion.div>

              <motion.div
                className='inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-sm font-medium text-white/90 mb-8 cursor-pointer group'
                whileHover={{
                  scale: 1.05,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                }}
                whileTap={{ scale: 0.95 }}
              >
                <Music className='w-4 h-4 mr-2 group-hover:rotate-12 transition-transform' />
                AI-Powered Booking Platform
                <Sparkles className='w-4 h-4 ml-2 group-hover:animate-pulse' />
              </motion.div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className='text-5xl md:text-7xl font-display font-bold mb-6 leading-tight'
            >
              No Manager?
              <motion.span
                className='gradient-text inline-block'
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                {' '}
                No Problem.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className='text-xl md:text-2xl text-white/90 mb-12 max-w-4xl mx-auto leading-relaxed'
            >
              TheGreenRoomAI helps indie artists book gigs, write pitches, and
              get on more stages—without chasing venues or waiting on
              gatekeepers.
            </motion.p>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className='mb-12'
            ></motion.div>

            <motion.div
              variants={fadeInUp}
              transition={{ duration: 0.6 }}
              className='flex items-center justify-center gap-8 text-white/80'
            >
              <motion.div
                className='flex items-center gap-2'
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className='w-5 h-5 text-primary-400' />
                <span>Free to join</span>
              </motion.div>
              <motion.div
                className='flex items-center gap-2'
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <CheckCircle className='w-5 h-5 text-primary-400' />
                <span>No credit card required</span>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Analytics Section */}
      <section className='py-12 bg-dark-900/20'>
        <div className='max-w-6xl mx-auto px-4'>
          {/* Analytics Toggle Button */}
          <div className='text-center mb-8'>
            <button
              onClick={() => setShowAnalytics(!showAnalytics)}
              className='bg-gradient-to-r from-green-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium shadow-lg'
            >
              {showAnalytics
                ? '📊 Hide Analytics'
                : '📊 Show Analytics Dashboard'}
            </button>
          </div>

          {/* Analytics Dashboard */}
          {showAnalytics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <AnalyticsDashboard />
            </motion.div>
          )}
        </div>
      </section>

      {/* Interactive Stats Section */}
      <section className='py-20 bg-dark-900/30'>
        <div className='max-w-6xl mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={staggerContainer}
            className='grid grid-cols-2 md:grid-cols-4 gap-8'
          >
            {[
              {
                number: '2,000+',
                label: 'Artists',
                icon: <Music className='w-6 h-6' />,
              },
              {
                number: '500+',
                label: 'Venues',
                icon: <Target className='w-6 h-6' />,
              },
              {
                number: '10,000+',
                label: 'Gigs Booked',
                icon: <Calendar className='w-6 h-6' />,
              },
              {
                number: '95%',
                label: 'Success Rate',
                icon: <TrendingUp className='w-6 h-6' />,
              },
            ].map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className='text-center group cursor-pointer'
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className='w-16 h-16 bg-gradient-to-br from-primary-500 to-accent-purple rounded-2xl flex items-center justify-center text-white mb-4 mx-auto group-hover:scale-110 transition-transform duration-300'
                  whileHover={{ rotate: 5 }}
                >
                  {stat.icon}
                </motion.div>
                <motion.div
                  className='text-3xl font-bold text-white mb-2'
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 200,
                    delay: index * 0.1,
                  }}
                >
                  {stat.number}
                </motion.div>
                <div className='text-white/70'>{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Enhanced For Artists Section */}
      <section className='py-20 bg-dark-900/50'>
        <div className='max-w-6xl mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={staggerContainer}
            className='text-center mb-16'
          >
            <motion.h2
              variants={fadeInUp}
              className='text-4xl md:text-5xl font-display font-bold mb-6'
            >
              For <span className='gradient-text'>Artists</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className='text-xl text-white/70 max-w-2xl mx-auto'
            >
              Focus on your music while AI handles the business side
            </motion.p>
          </motion.div>

          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: <Mic className='w-8 h-8' />,
                title: 'Smart gig recommendations',
                description:
                  'AI analyzes your music style and suggests venues that match your vibe and audience.',
                color: 'from-primary-500 to-accent-purple',
              },
              {
                icon: <Mail className='w-8 h-8' />,
                title: 'AI-generated outreach',
                description:
                  'Automated, personalized emails that actually get responses from venue owners.',
                color: 'from-accent-green to-accent-blue',
              },
              {
                icon: <Calendar className='w-8 h-8' />,
                title: 'Smart CRM tracking',
                description:
                  'Never lose track of a venue contact or past gig again. Everything organized automatically.',
                color: 'from-accent-purple to-accent-pink',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className='bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 group cursor-pointer relative overflow-hidden'
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: 5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className='text-xl font-semibold mb-4 group-hover:text-primary-400 transition-colors'>
                  {feature.title}
                </h3>
                <p className='text-white/70 leading-relaxed group-hover:text-white/90 transition-colors'>
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-br from-primary-500/5 to-accent-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  initial={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced For Venues Section */}
      <section className='py-20'>
        <div className='max-w-6xl mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={staggerContainer}
            className='text-center mb-16'
          >
            <motion.h2
              variants={fadeInUp}
              className='text-4xl md:text-5xl font-display font-bold mb-6'
            >
              For <span className='gradient-text'>Venues</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className='text-xl text-white/70 max-w-2xl mx-auto'
            >
              Discover and book amazing talent without the hassle
            </motion.p>
          </motion.div>

          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                icon: <Target className='w-8 h-8' />,
                title: 'Find perfect matches',
                description:
                  'Discover local artists who match your venue&apos;s vibe, budget, and audience preferences.',
                color: 'from-accent-green to-accent-blue',
              },
              {
                icon: <MessageSquare className='w-8 h-8' />,
                title: 'Curated gig pitches',
                description:
                  'Receive personalized booking requests in one organized inbox. No more spam or irrelevant emails.',
                color: 'from-accent-blue to-accent-purple',
              },
              {
                icon: <RotateCcw className='w-8 h-8' />,
                title: 'Easy rebooking',
                description:
                  'Manage all your bookings in one place and easily rebook artists your audience loved.',
                color: 'from-accent-purple to-accent-pink',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className='bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8 group cursor-pointer relative overflow-hidden'
                whileHover={{
                  scale: 1.02,
                  y: -5,
                  transition: { type: 'spring', stiffness: 300, damping: 20 },
                }}
                whileTap={{ scale: 0.98 }}
              >
                <motion.div
                  className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300`}
                  whileHover={{ rotate: -5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className='text-xl font-semibold mb-4 group-hover:text-accent-green transition-colors'>
                  {feature.title}
                </h3>
                <p className='text-white/70 leading-relaxed group-hover:text-white/90 transition-colors'>
                  {feature.description}
                </p>

                {/* Hover effect overlay */}
                <motion.div
                  className='absolute inset-0 bg-gradient-to-br from-accent-green/5 to-accent-blue/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  initial={false}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Loved by Musicians Section */}
      <section className='py-20 bg-dark-900/30'>
        <div className='max-w-6xl mx-auto px-4'>
          <motion.div
            initial='initial'
            whileInView='animate'
            viewport={{ once: true }}
            variants={staggerContainer}
            className='text-center mb-16'
          >
            <motion.h2
              variants={fadeInUp}
              className='text-4xl md:text-5xl font-display font-bold mb-6'
            >
              Loved by <span className='gradient-text'>Musicians</span>
            </motion.h2>
            <motion.p
              variants={fadeInUp}
              className='text-xl text-white/70 max-w-2xl mx-auto'
            >
              Join thousands of artists who&apos;ve simplified their booking
              process
            </motion.p>
          </motion.div>

          <div className='grid md:grid-cols-3 gap-8'>
            {[
              {
                name: 'Sarah Beamon',
                role: 'Indie Folk Artist',
                image:
                  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face&auto=format',
                quote:
                  'This is exactly what the independent music scene needs. Can&apos;t wait to see it launch!',
                rating: 5,
              },
              {
                name: 'Marcus Chen',
                role: 'Jazz Venue Owner',
                image:
                  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face&auto=format',
                quote:
                  'Finally, a platform that understands the needs of both artists and venues.',
                rating: 5,
              },
              {
                name: 'Elena Rodriguez',
                role: 'Electronic Producer',
                image:
                  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face&auto=format',
                quote:
                  'The AI-powered booking sounds revolutionary. I&apos;m excited to be part of this!',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className='bg-dark-800/50 backdrop-blur-sm border border-white/10 rounded-2xl p-8'
              >
                <div className='flex items-center mb-6'>
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name}
                    width={48}
                    height={48}
                    className='w-12 h-12 rounded-full object-cover mr-4'
                  />
                  <div>
                    <div className='font-semibold text-white'>
                      {testimonial.name}
                    </div>
                    <div className='text-sm text-white/70'>
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <div className='flex mb-4'>
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className='w-4 h-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-white/80 italic'>
                  &quot;{testimonial.quote}&quot;
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='py-12 bg-dark-950 border-t border-white/10'>
        <div className='max-w-6xl mx-auto px-4 text-center'>
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='mb-6'
          >
            <div className='w-40 h-40 md:w-48 md:h-48 mx-auto mb-8 relative'>
              <Image
                src='/logo-dark.png'
                alt='TheGreenRoom.ai Logo'
                width={192}
                height={192}
                className='object-contain'
              />
            </div>
          </motion.div>

          <div className='text-white/60 mb-4'>
            © 2024 TheGreenRoom.ai. All rights reserved.
          </div>
          <div className='flex justify-center space-x-6 text-white/60'>
            <a href='#' className='hover:text-white transition-colors'>
              Privacy
            </a>
            <a href='#' className='hover:text-white transition-colors'>
              Terms
            </a>
            <a href='#' className='hover:text-white transition-colors'>
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Home;
