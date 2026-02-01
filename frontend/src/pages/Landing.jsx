import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import { contactService } from '../services/contactService';
import { useAuth } from '../contexts/AuthContext';

function Landing() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Handle Get Started button click
  const handleGetStarted = () => {
    if (user) {
      // User is logged in, redirect to dashboard
      navigate('/dashboard');
    } else {
      // User is not logged in, redirect to signup
      navigate('/signup');
    }
  };
  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    subject: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');

  // Animation states
  const [isVisible, setIsVisible] = useState({});
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);

  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const aboutRef = useRef(null);
  const teamRef = useRef(null);
  const reviewsRef = useRef(null);

  // Mouse tracking for 3D effects
  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1
      });
    };

    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Scroll-triggered animations
  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({
            ...prev,
            [entry.target.dataset.section]: true
          }));
        }
      });
    }, observerOptions);

    const sections = [
      { ref: heroRef, name: 'hero' },
      { ref: featuresRef, name: 'features' },
      { ref: aboutRef, name: 'about' },
      { ref: teamRef, name: 'team' },
      { ref: reviewsRef, name: 'reviews' }
    ];

    sections.forEach(({ ref, name }) => {
      if (ref.current) {
        ref.current.dataset.section = name;
        observer.observe(ref.current);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Handle contact form input changes
  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle contact form submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    setContactError('');
    setContactSuccess(false);

    try {
      await contactService.submitContactForm(contactForm);
      setContactSuccess(true);
      setContactForm({
        fullName: '',
        email: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      setContactError(error.message || 'Failed to send message. Please try again.');
    } finally {
      setContactLoading(false);
    }
  };

  const features = [
    {
      icon: '💳',
      title: 'Multi-Wallet Management',
      description: 'Manage multiple wallets including cash, bank accounts, and credit cards all in one place.'
    },
    {
      icon: '💰',
      title: 'Debt & Loan Tracker',
      description: 'Track all your loans, credit cards, and debts with automated payment reminders and progress monitoring.'
    },
    {
      icon: '📊',
      title: 'Smart Analytics',
      description: 'Get detailed insights into your spending patterns with beautiful charts and reports.'
    },
    {
      icon: '🎯',
      title: 'Budget Planning',
      description: 'Set budgets, track expenses, and get alerts when you\'re approaching your limits.'
    },
    {
      icon: '🎯',
      title: 'Saving Goals',
      description: 'Set financial targets, track your progress, and celebrate milestones with our goal tracking system.'
    },

    {
      icon: '📱',
      title: 'Mobile Responsive',
      description: 'Access your finances anywhere, anytime with our fully responsive design.'
    },
    {
      icon: '🏆',
      title: 'Points & Achievements',
      description: 'Earn points for healthy financial habits and unlock achievements as you progress on your financial journey.'
    },
    {
      icon: '📄',
      title: 'Export & Reports',
      description: 'Download your financial data as CSV or PDF reports for record-keeping and tax purposes.'
    },
    {
      icon: '🔒',
      title: 'Secure & Private',
      description: 'Your financial data is encrypted and secure with industry-standard security measures.'
    }
  ];

  const whyChooseUs = [
    {
      icon: '⚡',
      title: 'Lightning Fast',
      description: 'Quick transactions, instant updates, and real-time synchronization.'
    },
    {
      icon: '📈',
      title: 'Smart Insights',
      description: 'AI-powered recommendations to help you make better financial decisions.'
    },
    {
      icon: '💰',
      title: 'Debt Management',
      description: 'Comprehensive debt tracking with payment reminders and progress monitoring.'
    },
    {
      icon: '📊',
      title: 'Advanced Reporting',
      description: 'Export your data as CSV or PDF reports for record-keeping and analysis.'
    }
  ];

  const teamMembers = [
    {
      name: 'Aryan Mittal',
      role: 'Full Stack Developer',
      avatar: 'AM',
      photo: '/images/team/aryan.jpeg',
      skills: ['MongoDB', 'Express.js', 'React', 'Node.js'],
      description: 'Led the development of BachatSaathi with expertise in full-stack development and project management.',
      github: 'https://github.com/heyaryanmittal',
      linkedin: 'https://www.linkedin.com/in/heyaryanmittal'
    }
  ];

  const reviews = [
    {
      name: 'Priya Sharma',
      role: 'Software Engineer',
      avatar: 'PS',
      rating: 5,
      comment: 'BachatSaathi has completely transformed how I manage my finances. The multi-wallet feature and debt tracker are game-changers!'
    },
    {
      name: 'Rahul Kumar',
      role: 'Business Owner',
      avatar: 'RK',
      rating: 5,
      comment: 'The budget tracking and saving goals features help me keep my business expenses in check. The points system keeps me motivated!'
    },
    {
      name: 'Anita Patel',
      role: 'Student',
      avatar: 'AP',
      rating: 5,
      comment: 'Perfect for students like me! The recurring transaction feature and goal tracking help me manage my limited budget effectively.'
    },
    {
      name: 'Vikram Singh',
      role: 'Freelancer',
      avatar: 'VS',
      rating: 5,
      comment: 'As a freelancer, managing multiple income sources was chaotic. BachatSaathi made it simple with export reports and debt management.'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section ref={heroRef} className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Background Elements with 3D Parallax */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900"></div>
        <div
          className="absolute inset-0 opacity-30"
          style={{
            transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 0)`,
          }}
        >
          <div
            className="absolute top-10 left-10 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-blob"
            style={{
              transform: `translate3d(${mousePosition.x * -15}px, ${mousePosition.y * -15}px, 0) scale(${1 + scrollY * 0.0001})`,
            }}
          ></div>
          <div
            className="absolute top-0 right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"
            style={{
              transform: `translate3d(${mousePosition.x * 20}px, ${mousePosition.y * 15}px, 0) scale(${1 + scrollY * 0.00005})`,
            }}
          ></div>
          <div
            className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"
            style={{
              transform: `translate3d(${mousePosition.x * -10}px, ${mousePosition.y * 20}px, 0) scale(${1 + scrollY * 0.00008})`,
            }}
          ></div>
        </div>

        {/* Floating geometric shapes */}
        <div
          className="absolute top-20 right-20 opacity-10"
          style={{
            transform: `translate3d(${mousePosition.x * 30}px, ${mousePosition.y * 30}px, 0) rotate(${scrollY * 0.1}deg)`,
          }}
        >
          <svg width="100" height="100" viewBox="0 0 100 100" className="animate-float3D">
            <polygon points="50,10 90,90 10,90" fill="currentColor" className="text-blue-500" />
          </svg>
        </div>
        <div
          className="absolute bottom-20 left-10 opacity-10"
          style={{
            transform: `translate3d(${mousePosition.x * -25}px, ${mousePosition.y * -25}px, 0) rotate(${scrollY * -0.15}deg)`,
          }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" className="animate-float3D animation-delay-2000">
            <circle cx="40" cy="40" r="30" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500" />
          </svg>
        </div>

        <div className="relative max-w-7xl mx-auto">
          <div className="text-center">
            <div className="mb-8 animate-fadeInUp">
              <div
                className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-large animate-float3D"
                style={{
                  transform: `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0) rotateX(${mousePosition.y * 10}deg) rotateY(${mousePosition.x * 10}deg)`,
                }}
              >
                <span className="text-white font-bold text-4xl">₹</span>
              </div>
              <h1
                className="text-4xl md:text-6xl font-bold mb-6 w-full max-w-full overflow-visible"
                style={{
                  transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`,
                }}
              >
                <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  BachatSaathi
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto w-full overflow-visible">
                Your Smart Financial Companion for Better Money Management
              </p>
              <p className="text-lg text-gray-500 dark:text-gray-400 mb-12 max-w-2xl mx-auto w-full overflow-visible">
                Take control of your finances with our comprehensive personal finance management platform.
                Track expenses, manage budgets, monitor debts, set saving goals, and achieve your financial dreams with ease.
              </p>
            </div>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slideInRight"
              style={{
                transform: `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 0)`,
              }}
            >
              <button
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-large hover:shadow-2xl w-full sm:w-auto"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg) scale(${isVisible.hero ? 1 : 0.8})`,
                }}
              >
                <span className="mr-2">🚀</span>
                {user ? 'Go to Dashboard' : 'Get Started Free'}
              </button>
              <Link
                to="/login"
                className="border-2 border-white text-white bg-transparent px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm w-full sm:w-auto"
                style={{
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 3}deg) rotateY(${mousePosition.x * 3}deg)`,
                }}
              >
                <span className="mr-2">👋</span>
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-6 leading-tight"
              style={{
                transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
              }}
            >
              Powerful Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to manage your finances effectively, all in one beautiful platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="card-modern p-8 text-center card-hover group animate-fadeInUp relative overflow-hidden"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 2}deg) rotateY(${mousePosition.x * 2}deg) translateZ(${isVisible.features ? 0 : 50}px)`,
                }}
              >
                {/* 3D background effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    transform: `translate3d(${mousePosition.x * 10}px, ${mousePosition.y * 10}px, 0)`,
                  }}
                ></div>

                <div
                  className="text-6xl mb-6 group-hover:animate-wiggle relative z-10"
                  style={{
                    transform: `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0)`,
                  }}
                >
                  {feature.icon}
                </div>
                <h3
                  className="text-2xl font-bold text-gray-900 dark:text-white mb-4 relative z-10 w-full overflow-visible"
                  style={{
                    transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`,
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10 w-full overflow-visible"
                  style={{
                    transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                  }}
                >
                  {feature.description}
                </p>

                {/* 3D hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fadeInUp">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-6 leading-tight w-full overflow-visible">
                About BachatSaathi
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                BachatSaathi was born from the vision of making personal finance management
                accessible, intuitive, and powerful for everyone. We believe that financial
                wellness should not be a luxury but a fundamental right.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
                Our team of financial experts and technology enthusiasts have crafted a
                platform that combines the best of both worlds - sophisticated financial
                tools with an interface so simple that anyone can use it. From budget tracking
                to debt management, saving goals to export reports, we've got everything you need.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Founded in 2024</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">10,000+ Happy Users</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">99.9% Uptime</span>
                </div>
              </div>
            </div>
            <div className="relative animate-slideInRight">
              <div className="card-modern p-8 bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                <div className="text-center">
                  <div className="text-6xl mb-6">🎯</div>
                  <h3 className="text-2xl font-bold mb-4">Our Mission</h3>
                  <p className="text-lg opacity-90 leading-relaxed">
                    To empower individuals and families to take control of their financial
                    future through innovative, user-friendly tools and personalized insights.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section ref={teamRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-4xl md:text-5xl font-bold text-gradient mb-6"
              style={{
                transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
              }}
            >
              Meet the Developer
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The passionate developer behind BachatSaathi who made this vision a reality.
            </p>
          </div>

          <div className="flex flex-wrap justify-center gap-6 lg:gap-8">
            {teamMembers.map((member, index) => (
              <div
                key={index}
                className="card-modern p-6 text-center card-hover group animate-fadeInUp relative overflow-hidden w-full max-w-md"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 1}deg) translateZ(${isVisible.team ? 0 : 30}px)`,
                }}
              >
                {/* 3D background effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    transform: `translate3d(${mousePosition.x * 8}px, ${mousePosition.y * 8}px, 0)`,
                  }}
                ></div>

                {/* Profile Photo */}
                <div className="relative mb-6">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-32 h-32 mx-auto rounded-full object-cover shadow-large group-hover:scale-105 transition-transform duration-300 border-4 border-white dark:border-gray-700 relative z-10"
                      style={{
                        transform: `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 0)`,
                      }}
                    />
                  ) : (
                    <div
                      className="w-32 h-32 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-3xl shadow-large group-hover:scale-105 transition-transform duration-300 relative z-10"
                      style={{
                        transform: `translate3d(${mousePosition.x * 4}px, ${mousePosition.y * 4}px, 0) rotateY(${mousePosition.x * 5}deg)`,
                      }}
                    >
                      {member.avatar}
                    </div>
                  )}
                  <div
                    className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 rounded-full border-4 border-white dark:border-gray-800 flex items-center justify-center"
                    style={{
                      transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`,
                    }}
                  >
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>

                {/* Member Info */}
                <h3
                  className="text-xl font-bold text-gray-900 dark:text-white mb-2 relative z-10 w-full overflow-visible"
                  style={{
                    transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                  }}
                >
                  {member.name}
                </h3>
                <p
                  className="text-blue-600 dark:text-blue-400 font-semibold mb-3 relative z-10 w-full overflow-visible"
                  style={{
                    transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
                  }}
                >
                  {member.role}
                </p>
                <p
                  className="text-gray-600 dark:text-gray-300 text-sm mb-4 leading-relaxed relative z-10 w-full overflow-visible"
                  style={{
                    transform: `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
                  }}
                >
                  {member.description}
                </p>

                {/* Skills */}
                <div className="mb-4 relative z-10">
                  <div className="flex flex-wrap gap-2 justify-center">
                    {member.skills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full"
                        style={{
                          transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                        }}
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div
                  className="flex justify-center space-x-3 relative z-10"
                  style={{
                    transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                  }}
                >
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-gray-800 dark:bg-gray-700 rounded-lg flex items-center justify-center text-white hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-300"
                    title="GitHub"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.30.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                  </a>
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors duration-300"
                    title="LinkedIn"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </a>
                </div>

                {/* 3D hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>

          {/* Team Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 text-center">
            <div
              className="animate-fadeInUp"
              style={{
                animationDelay: '0.5s',
                transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
              }}
            >
              <div className="text-4xl font-bold text-gradient mb-2 w-full text-center overflow-visible">1</div>
              <p className="text-gray-600 dark:text-gray-300 w-full text-center overflow-visible">Dedicated Developers</p>
            </div>
            <div
              className="animate-fadeInUp"
              style={{
                animationDelay: '0.6s',
                transform: `translate3d(${mousePosition.x * 0.8}px, ${mousePosition.y * 0.8}px, 0)`,
              }}
            >
              <div className="text-4xl font-bold text-gradient mb-2 w-full text-center overflow-visible">6+</div>
              <p className="text-gray-600 dark:text-gray-300 w-full text-center overflow-visible">Months of Development</p>
            </div>
            <div
              className="animate-fadeInUp"
              style={{
                animationDelay: '0.7s',
                transform: `translate3d(${mousePosition.x * 0.6}px, ${mousePosition.y * 0.6}px, 0)`,
              }}
            >
              <div className="text-4xl font-bold text-gradient mb-2 w-full text-center overflow-visible">100%</div>
              <p className="text-gray-600 dark:text-gray-300 w-full text-center overflow-visible">Passion & Dedication</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose BachatSaathi Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-8 leading-tight"
              style={{
                transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
              }}
            >
              Why Choose BachatSaathi?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              We're not just another finance app. Here's what makes us different.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {whyChooseUs.map((item, index) => (
              <div
                key={index}
                className="flex items-start space-x-6 p-8 card-modern card-hover animate-fadeInUp relative overflow-hidden group"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 1}deg)`,
                }}
              >
                {/* 3D background effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    transform: `translate3d(${mousePosition.x * 5}px, ${mousePosition.y * 5}px, 0)`,
                  }}
                ></div>

                <div
                  className="text-5xl flex-shrink-0 relative z-10"
                  style={{
                    transform: `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 0)`,
                  }}
                >
                  {item.icon}
                </div>
                <div className="relative z-10">
                  <h3
                    className="text-2xl font-bold text-gray-900 dark:text-white mb-3 relative z-10 w-full overflow-visible"
                    style={{
                      transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                    }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-gray-600 dark:text-gray-300 leading-relaxed relative z-10 w-full overflow-visible"
                    style={{
                      transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
                    }}
                  >
                    {item.description}
                  </p>
                </div>

                {/* 3D hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section ref={reviewsRef} className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-900 dark:to-purple-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 px-4">
            <h2
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gradient mb-6 leading-tight w-full max-w-full overflow-visible whitespace-nowrap min-w-0"
              style={{
                transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
              }}
            >
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Don't just take our word for it. Here's what our amazing community has to say.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {reviews.map((review, index) => (
              <div
                key={index}
                className="card-modern p-6 card-hover animate-fadeInUp relative overflow-hidden group"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  transform: `perspective(1000px) rotateX(${mousePosition.y * 1}deg) rotateY(${mousePosition.x * 1}deg) translateZ(${isVisible.reviews ? 0 : 20}px)`,
                }}
              >
                {/* 3D background effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    transform: `translate3d(${mousePosition.x * 6}px, ${mousePosition.y * 6}px, 0)`,
                  }}
                ></div>

                <div
                  className="flex items-center mb-4 relative z-10"
                  style={{
                    transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                  }}
                >
                  <div
                    className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4 relative z-10"
                    style={{
                      transform: `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 0)`,
                    }}
                  >
                    {review.avatar}
                  </div>
                  <div className="relative z-10">
                    <h4
                      className="font-bold text-gray-900 dark:text-white"
                      style={{
                        transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
                      }}
                    >
                      {review.name}
                    </h4>
                    <p
                      className="text-sm text-gray-600 dark:text-gray-400"
                      style={{
                        transform: `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
                      }}
                    >
                      {review.role}
                    </p>
                  </div>
                </div>
                <div
                  className="flex mb-3 relative z-10"
                  style={{
                    transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
                  }}
                >
                  {[...Array(review.rating)].map((_, i) => (
                    <span
                      key={i}
                      className="text-yellow-400 text-lg"
                      style={{
                        transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
                      }}
                    >
                      ⭐
                    </span>
                  ))}
                </div>
                <p
                  className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed relative z-10"
                  style={{
                    transform: `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
                  }}
                >
                  "{review.comment}"
                </p>

                {/* 3D hover effect overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-yellow-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Us Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gradient mb-6 leading-tight">
              Get In Touch
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fadeInUp">
              <div className="space-y-8">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white text-xl">
                    📧
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Email Us</h3>
                    <p className="text-gray-600 dark:text-gray-300">support@bachatsaathi.com</p>
                    <p className="text-gray-600 dark:text-gray-300">hello@bachatsaathi.com</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-xl flex items-center justify-center text-white text-xl">
                    📱
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Call Us</h3>
                    <p className="text-gray-600 dark:text-gray-300">+91 77176 25496</p>
                    <p className="text-gray-600 dark:text-gray-300">Mon-Fri 9AM-6PM IST</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-white text-xl">
                    📍
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Visit Us</h3>
                    <p className="text-gray-600 dark:text-gray-300">123 Finance Street</p>
                    <p className="text-gray-600 dark:text-gray-300">Mumbai, Maharashtra 400001</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="animate-slideInRight">
              <form className="card-modern p-8 space-y-6" onSubmit={handleContactSubmit}>
                {/* Success Message */}
                {contactSuccess && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 animate-fadeInUp">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        Thank you for your message! We'll get back to you soon.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {contactError && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 animate-fadeInUp">
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-sm font-medium text-red-800 dark:text-red-200">{contactError}</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={contactForm.fullName}
                    onChange={handleContactChange}
                    className="input-modern"
                    placeholder="Enter your full name"
                    required
                    disabled={contactLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={contactForm.email}
                    onChange={handleContactChange}
                    className="input-modern"
                    placeholder="Enter your email"
                    required
                    disabled={contactLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    name="subject"
                    value={contactForm.subject}
                    onChange={handleContactChange}
                    className="input-modern"
                    placeholder="What's this about?"
                    required
                    disabled={contactLoading}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    rows="5"
                    name="message"
                    value={contactForm.message}
                    onChange={handleContactChange}
                    className="input-modern resize-none"
                    placeholder="Tell us more..."
                    required
                    disabled={contactLoading}
                  ></textarea>
                </div>
                <button
                  type="submit"
                  className="btn-primary w-full flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={contactLoading}
                >
                  {contactLoading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span className="mr-2">📤</span>
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            transform: `translate3d(${mousePosition.x * 15}px, ${mousePosition.y * 15}px, 0)`,
          }}
        >
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/20 rounded-full blur-lg animate-pulse animation-delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/5 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2
            className="text-4xl md:text-5xl font-bold text-white mb-6 animate-fadeInUp"
            style={{
              transform: `translate3d(${mousePosition.x * 2}px, ${mousePosition.y * 2}px, 0)`,
            }}
          >
            Ready to Take Control of Your Financial Future?
          </h2>
          <p
            className="text-xl text-blue-100 mb-8 animate-fadeInUp"
            style={{
              transform: `translate3d(${mousePosition.x * 1}px, ${mousePosition.y * 1}px, 0)`,
            }}
          >
            Join thousands of users who have already transformed their financial lives with BachatSaathi.
            From debt management to saving goals, we've got all the tools you need for financial success.
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-slideInRight"
            style={{
              transform: `translate3d(${mousePosition.x * 3}px, ${mousePosition.y * 3}px, 0)`,
            }}
          >
            <button
              onClick={handleGetStarted}
              className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-large hover:shadow-2xl relative overflow-hidden group"
              style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 5}deg) rotateY(${mousePosition.x * 5}deg)`,
              }}
            >
              {/* 3D button effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="mr-2 relative z-10">🚀</span>
              <span className="relative z-10">{user ? 'Go to Dashboard' : 'Start Your Journey'}</span>
            </button>
            <Link
              to="/login"
              className="border-2 border-white text-white px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white hover:text-blue-600 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 backdrop-blur-sm relative overflow-hidden group"
              style={{
                transform: `perspective(1000px) rotateX(${mousePosition.y * 3}deg) rotateY(${mousePosition.x * 3}deg)`,
              }}
            >
              {/* 3D button effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <span className="mr-2 relative z-10">👋</span>
              <span className="relative z-10">Welcome Back</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default Landing;
