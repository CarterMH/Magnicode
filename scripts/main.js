// Enhanced Magnicode Website JavaScript
// Modern ES6+ implementation with particle effects and interactive features
// Features: Dropdown categories, project management, animated forms, particle backgrounds

/*
  EMAIL CONFIGURATION SETUP:
  
  To enable full EmailJS functionality:
  1. Create account at https://www.emailjs.com/
  2. Add an email service (Gmail, Outlook, etc.)
  3. Create an email template with variables: from_name, from_email, to_email, message, subject
  4. Replace the placeholder values in FormHandler constructor:
     - serviceId: Your EmailJS service ID
     - templateId: Your EmailJS template ID  
     - publicKey: Your EmailJS public key
  
  Current fallback: Opens user's default email client with pre-filled message
  Target recipient: carter.crouch@united.com
*/

// ===== GLOBAL VARIABLES =====
let isLoaded = false;
let scrollY = 0;
let ticking = false;

// ===== UTILITY FUNCTIONS =====
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

const debounce = (func, wait, immediate) => {
  let timeout;
  return function executedFunction() {
    const context = this;
    const args = arguments;
    const later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

const lerp = (start, end, factor) => start + (end - start) * factor;

const isInViewport = (element) => {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
};

// ===== LOADING SCREEN =====
class LoadingScreen {
  constructor() {
    this.loader = $('#loader');
    this.progress = $('.loader-progress');
    this.currentProgress = 0;
    this.targetProgress = 0;
  }

  init() {
    this.simulate();
  }

  simulate() {
    const interval = setInterval(() => {
      this.targetProgress += Math.random() * 15;
      if (this.targetProgress >= 100) {
        this.targetProgress = 100;
        clearInterval(interval);
        setTimeout(() => this.hide(), 500);
      }
    }, 200);

    this.animate();
  }

  animate() {
    this.currentProgress = lerp(this.currentProgress, this.targetProgress, 0.1);
    this.progress.style.width = `${this.currentProgress}%`;

    if (Math.abs(this.targetProgress - this.currentProgress) > 0.1) {
      requestAnimationFrame(() => this.animate());
    }
  }

  hide() {
    this.loader.classList.add('hidden');
    setTimeout(() => {
      this.loader.style.display = 'none';
      isLoaded = true;
      document.body.style.overflow = 'auto';
    }, 500);
  }
}

// ===== PARTICLES SYSTEM =====
class ParticlesSystem {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
    this.mouse = { x: 0, y: 0 };
  }

  init() {
    // Initialize particles.js if available
    if (typeof particlesJS !== 'undefined') {
      particlesJS('particles-js', {
        particles: {
          number: {
            value: 100,
            density: {
              enable: true,
              value_area: 800
            }
          },
          color: {
            value: ['#667eea', '#764ba2', '#f093fb', '#4facfe']
          },
          shape: {
            type: 'circle',
            stroke: {
              width: 0,
              color: '#000000'
            }
          },
          opacity: {
            value: 0.3,
            random: false,
            anim: {
              enable: true,
              speed: 1,
              opacity_min: 0.1,
              sync: false
            }
          },
          size: {
            value: 3,
            random: true,
            anim: {
              enable: true,
              speed: 2,
              size_min: 0.1,
              sync: false
            }
          },
          line_linked: {
            enable: true,
            distance: 150,
            color: '#667eea',
            opacity: 0.2,
            width: 1
          },
          move: {
            enable: true,
            speed: 2,
            direction: 'none',
            random: false,
            straight: false,
            out_mode: 'out',
            bounce: false,
            attract: {
              enable: true,
              rotateX: 600,
              rotateY: 1200
            }
          }
        },
        interactivity: {
          detect_on: 'canvas',
          events: {
            onhover: {
              enable: true,
              mode: 'grab'
            },
            onclick: {
              enable: true,
              mode: 'push'
            },
            resize: true
          },
          modes: {
            grab: {
              distance: 140,
              line_linked: {
                opacity: 1
              }
            },
            push: {
              particles_nb: 4
            }
          }
        },
        retina_detect: true
      });
    }
  }
}

// ===== NAVIGATION =====
class Navigation {
  constructor() {
    this.navbar = $('#navbar');
    this.navMenu = $('#nav-menu');
    this.hamburger = $('#hamburger');
    this.navLinks = $$('.nav-link');
    this.sections = $$('section[id]');
  }

  init() {
    this.bindEvents();
    this.updateActiveLink();
  }

  bindEvents() {
    // Hamburger menu toggle
    this.hamburger.addEventListener('click', () => {
      this.hamburger.classList.toggle('active');
      this.navMenu.classList.toggle('active');
    });

    // Close mobile menu when clicking on a link
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => {
        this.hamburger.classList.remove('active');
        this.navMenu.classList.remove('active');
      });
    });

    // Smooth scrolling for navigation links
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href').substring(1);
        const targetSection = $(`#${targetId}`);
        
        if (targetSection) {
          const offsetTop = targetSection.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    // Navbar scroll effect
    window.addEventListener('scroll', throttle(() => {
      if (window.scrollY > 50) {
        this.navbar.classList.add('scrolled');
      } else {
        this.navbar.classList.remove('scrolled');
      }
      this.updateActiveLink();
    }, 100));
  }

  updateActiveLink() {
    let current = '';
    
    this.sections.forEach(section => {
      const sectionTop = section.offsetTop - 100;
      if (scrollY >= sectionTop) {
        current = section.getAttribute('id');
      }
    });

    this.navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href').substring(1) === current) {
        link.classList.add('active');
      }
    });
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
  constructor() {
    this.animatedElements = $$('[data-animate]');
    this.counters = $$('.stat-number[data-target]');
    this.counterAnimated = new Set();
  }

  init() {
    this.observeElements();
    this.bindScrollEvents();
  }

  observeElements() {
    const options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          
          // Animate counters
          if (entry.target.classList.contains('stat-number')) {
            this.animateCounter(entry.target);
          }
        }
      });
    }, options);

    // Observe animated elements
    this.animatedElements.forEach(el => observer.observe(el));
    
    // Observe sections for fade-in animation
    $$('section').forEach((section, index) => {
      section.setAttribute('data-animate', 'fade-in');
      section.style.animationDelay = `${index * 0.2}s`;
      observer.observe(section);
    });

    // Observe project cards
    $$('.project-card').forEach((card, index) => {
      card.setAttribute('data-animate', 'slide-up');
      card.style.animationDelay = `${index * 0.1}s`;
      observer.observe(card);
    });

    // Observe stat counters
    this.counters.forEach(counter => observer.observe(counter));
  }

  animateCounter(element) {
    if (this.counterAnimated.has(element)) return;
    this.counterAnimated.add(element);

    const target = parseInt(element.getAttribute('data-target'));
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const updateCounter = () => {
      current += step;
      if (current < target) {
        element.textContent = Math.floor(current);
        requestAnimationFrame(updateCounter);
      } else {
        element.textContent = target;
      }
    };

    updateCounter();
  }

  bindScrollEvents() {
    window.addEventListener('scroll', throttle(() => {
      scrollY = window.scrollY;
      this.parallaxEffect();
    }, 16));
  }

  parallaxEffect() {
    const heroVisual = $('.hero-visual');
    if (heroVisual) {
      const offset = scrollY * 0.5;
      heroVisual.style.transform = `translateY(${offset}px)`;
    }
  }
}

// ===== TYPEWRITER EFFECT =====
class TypewriterEffect {
  constructor(element, texts, speed = 100) {
    this.element = element;
    this.texts = Array.isArray(texts) ? texts : [texts];
    this.speed = speed;
    this.textIndex = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this.isPaused = false;
  }

  init() {
    this.type();
  }

  type() {
    const currentText = this.texts[this.textIndex];
    
    if (this.isDeleting) {
      this.element.textContent = currentText.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      this.element.textContent = currentText.substring(0, this.charIndex + 1);
      this.charIndex++;
    }

    let typeSpeed = this.speed;

    if (this.isDeleting) {
      typeSpeed /= 2;
    }

    if (!this.isDeleting && this.charIndex === currentText.length) {
      typeSpeed = 2000;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.textIndex = (this.textIndex + 1) % this.texts.length;
      typeSpeed = 500;
    }

    setTimeout(() => this.type(), typeSpeed);
  }
}

// ===== FORM HANDLER =====
class FormHandler {
  constructor() {
    this.form = $('#contact-form');
    this.inputs = $$('.form-input');
    this.emailConfig = {
      serviceId: 'service_x8ncxy5', // Will be replaced with actual EmailJS service
      templateId: 'template_9uwketw', // Will be replaced with actual template
      publicKey: '_vfZ40LrC8rCN24Ka' // Will be replaced with actual key
    };
  }

  init() {
    if (!this.form) return;
    
    this.initEmailJS();
    this.bindEvents();
    this.setupValidation();
  }

  initEmailJS() {
    // Initialize EmailJS - you'll need to replace with your actual EmailJS public key
    if (typeof emailjs !== 'undefined') {
      emailjs.init(this.emailConfig.publicKey);
      console.log('📧 EmailJS initialized for Carter at:', this.recipientEmail);
    } else {
      console.warn('📧 EmailJS not loaded - using fallback email method');
    }
  }

  bindEvents() {
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Floating label effect
    this.inputs.forEach(input => {
      // Handle focus - always float label when focused
      input.addEventListener('focus', () => {
        input.parentNode.classList.add('focused');
      });

      // Handle blur - only remove if no value
      input.addEventListener('blur', () => {
        if (!input.value.trim()) {
          input.parentNode.classList.remove('focused');
        }
      });

      // Handle input - float label when user types
      input.addEventListener('input', () => {
        if (input.value.trim()) {
          input.parentNode.classList.add('focused');
        } else {
          input.parentNode.classList.remove('focused');
        }
      });

      // Check if input has value on page load
      if (input.value.trim()) {
        input.parentNode.classList.add('focused');
      }
    });
  }

  setupValidation() {
    this.inputs.forEach(input => {
      input.addEventListener('input', () => {
        this.validateInput(input);
      });
    });
  }

  validateInput(input) {
    const value = input.value.trim();
    const type = input.type;
    
    input.classList.remove('error', 'success');
    
    if (type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (value && emailRegex.test(value)) {
        input.classList.add('success');
      } else if (value) {
        input.classList.add('error');
      }
    } else if (input.required) {
      if (value.length > 0) {
        input.classList.add('success');
      }
    }
  }

  async handleSubmit() {
    const button = this.form.querySelector('.form-submit');
    const originalText = button.innerHTML;

    // Validate form first
    const name = $('#name').value.trim();
    const email = $('#email').value.trim();
    const message = $('#message').value.trim();

    if (!name || !email || !message) {
      this.showError('Please fill in all fields');
      return;
    }

    if (!this.isValidEmail(email)) {
      this.showError('Please enter a valid email address');
      return;
    }

    // Show loading state
    button.innerHTML = '<span>Sending to Carter...</span><i class="fas fa-spinner fa-spin"></i>';
    button.disabled = true;

    try {
      // Prepare email data
      const emailData = {
        from_name: name,
        from_email: email,
        to_email: this.recipientEmail,
        message: message,
        subject: `New message from ${name} via Magnicode`,
        timestamp: new Date().toLocaleString()
      };

      // Try EmailJS first (if configured)
      let emailSent = false;
      
      if (typeof emailjs !== 'undefined' && this.emailConfig.publicKey !== 'YOUR_PUBLIC_KEY') {
        try {
          await this.sendViaEmailJS(emailData);
          emailSent = true;
        } catch (emailJSError) {
          console.warn('EmailJS failed, trying fallback method:', emailJSError);
        }
      }

      // Fallback: Use mailto link method
      if (!emailSent) {
        this.sendViaMailto(emailData);
      }
      
      // Show success state
      button.innerHTML = '<span>Sent to Carter!</span><i class="fas fa-check"></i>';
      button.style.background = 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)';
      
      // Show success message
      this.showSuccessMessage(`Message sent to Carter at ${this.recipientEmail}! 🎉`);
      
      // Reset form
      this.form.reset();
      this.inputs.forEach(input => {
        input.parentNode.classList.remove('focused');
        input.classList.remove('error', 'success');
      });
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        button.style.background = '';
      }, 3000);
      
    } catch (error) {
      console.error('Email sending failed:', error);
      
      // Show error state
      button.innerHTML = '<span>Error!</span><i class="fas fa-times"></i>';
      button.style.background = 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)';
      
      this.showError('Failed to send message. Please try again or email Carter directly.');
      
      setTimeout(() => {
        button.innerHTML = originalText;
        button.disabled = false;
        button.style.background = '';
      }, 3000);
    }
  }

  async sendViaEmailJS(emailData) {
    const templateParams = {
      from_name: emailData.from_name,
      from_email: emailData.from_email,
      to_name: 'Carter',
      to_email: emailData.to_email,
      message: emailData.message,
      subject: emailData.subject,
      reply_to: emailData.from_email
    };

    // Debug logging to help troubleshoot
    console.log('📧 Sending email with data:', emailData);
    console.log('📧 EmailJS template params:', templateParams);

    const response = await emailjs.send(
      this.emailConfig.serviceId,
      this.emailConfig.templateId,
      templateParams
    );

    if (response.status !== 200) {
      throw new Error('EmailJS response not OK');
    }

    console.log('✅ Email sent successfully via EmailJS!');
  }

  sendViaMailto(emailData) {
    const subject = encodeURIComponent(emailData.subject);
    const body = encodeURIComponent(
      `Name: ${emailData.from_name}\nEmail: ${emailData.from_email}\n\nMessage:\n${emailData.message}\n\n---\nSent via Magnicode contact form\nTimestamp: ${emailData.timestamp}`
    );
    
    const mailtoLink = `mailto:${this.recipientEmail}?subject=${subject}&body=${body}`;
    
    // Debug logging
    console.log('📧 Mailto fallback data:', { 
      name: emailData.from_name, 
      email: emailData.from_email, 
      message: emailData.message 
    });
    
    // Open user's default email client
    window.open(mailtoLink, '_blank');
    
    console.log('📧 Opening email client to send to Carter');
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showSuccessMessage(message) {
    this.showNotification(message, 'success');
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `form-notification ${type}`;
    notification.textContent = message;
    
    const colors = {
      success: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
      error: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
      info: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)'
    };

    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${colors[type]};
      color: white;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 600;
      z-index: 10001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      max-width: 400px;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 5000);
  }
}

// ===== CURSOR EFFECT =====
class CursorEffect {
  constructor() {
    this.cursor = null;
    this.cursorFollower = null;
    this.mouseX = 0;
    this.mouseY = 0;
    this.followerX = 0;
    this.followerY = 0;
  }

  init() {
    // Only add custom cursor on desktop
    if (window.innerWidth > 1024) {
      this.createCursor();
      this.bindEvents();
      this.animate();
    }
  }

  createCursor() {
    this.cursor = document.createElement('div');
    this.cursor.className = 'custom-cursor';
    this.cursor.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 10px;
      height: 10px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      transform: translate(-50%, -50%);
      transition: transform 0.1s ease;
    `;

    this.cursorFollower = document.createElement('div');
    this.cursorFollower.className = 'cursor-follower';
    this.cursorFollower.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 30px;
      height: 30px;
      border: 2px solid rgba(102, 126, 234, 0.3);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transform: translate(-50%, -50%);
    `;

    document.body.appendChild(this.cursor);
    document.body.appendChild(this.cursorFollower);
  }

  bindEvents() {
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      
      this.cursor.style.left = `${this.mouseX}px`;
      this.cursor.style.top = `${this.mouseY}px`;
    });

    // Cursor hover effects
    const hoverElements = $$('a, button, .project-card, .team-card');
    hoverElements.forEach(el => {
      el.addEventListener('mouseenter', () => {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(2)';
        this.cursorFollower.style.transform = 'translate(-50%, -50%) scale(2)';
      });

      el.addEventListener('mouseleave', () => {
        this.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        this.cursorFollower.style.transform = 'translate(-50%, -50%) scale(1)';
      });
    });
  }

  animate() {
    this.followerX = lerp(this.followerX, this.mouseX, 0.1);
    this.followerY = lerp(this.followerY, this.mouseY, 0.1);
    
    this.cursorFollower.style.left = `${this.followerX}px`;
    this.cursorFollower.style.top = `${this.followerY}px`;
    
    requestAnimationFrame(() => this.animate());
  }
}

// ===== THEME MANAGER =====
class ThemeManager {
  constructor() {
    this.currentTheme = 'dark';
    this.themeToggle = null;
  }

  init() {
    this.createThemeToggle();
    this.loadTheme();
  }

  createThemeToggle() {
    this.themeToggle = document.createElement('button');
    this.themeToggle.className = 'theme-toggle';
    this.themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    this.themeToggle.style.cssText = `
      position: fixed;
      top: 50%;
      right: 20px;
      transform: translateY(-50%);
      width: 50px;
      height: 50px;
      background: var(--primary-gradient);
      border: none;
      border-radius: 50%;
      color: white;
      font-size: 20px;
      cursor: pointer;
      z-index: 1000;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-lg);
    `;

    this.themeToggle.addEventListener('click', () => this.toggleTheme());
    document.body.appendChild(this.themeToggle);
  }

  toggleTheme() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    this.saveTheme();
  }

  applyTheme() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
    this.themeToggle.innerHTML = this.currentTheme === 'dark' ? 
      '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
  }

  saveTheme() {
    localStorage.setItem('theme', this.currentTheme);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      this.currentTheme = savedTheme;
      this.applyTheme();
    }
  }
}

// ===== PERFORMANCE MONITOR =====
class PerformanceMonitor {
  constructor() {
    this.fps = 60;
    this.lastTime = performance.now();
    this.frame = 0;
  }

  init() {
    if (window.location.hash.includes('debug')) {
      this.createMonitor();
      this.startMonitoring();
    }
  }

  createMonitor() {
    const monitor = document.createElement('div');
    monitor.id = 'perf-monitor';
    monitor.style.cssText = `
      position: fixed;
      top: 10px;
      left: 10px;
      background: rgba(0, 0, 0, 0.8);
      color: white;
      padding: 10px;
      border-radius: 5px;
      font-family: monospace;
      font-size: 12px;
      z-index: 10000;
    `;
    document.body.appendChild(monitor);
  }

  startMonitoring() {
    const monitor = $('#perf-monitor');
    
    const updateStats = () => {
      const now = performance.now();
      const delta = now - this.lastTime;
      this.fps = Math.round(1000 / delta);
      this.lastTime = now;
      this.frame++;

      if (monitor) {
        monitor.innerHTML = `
          FPS: ${this.fps}<br>
          Frame: ${this.frame}<br>
          Memory: ${(performance.memory?.usedJSHeapSize / 1024 / 1024).toFixed(1) || 'N/A'} MB
        `;
      }

      requestAnimationFrame(updateStats);
    };

    updateStats();
  }
}

// ===== EASTER EGGS =====
class EasterEggs {
  constructor() {
    this.konamiCode = [
      'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
      'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
      'KeyB', 'KeyA'
    ];
    this.userInput = [];
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    document.addEventListener('keydown', (e) => {
      this.userInput.push(e.code);
      
      if (this.userInput.length > this.konamiCode.length) {
        this.userInput.shift();
      }
      
      if (this.userInput.join(',') === this.konamiCode.join(',')) {
        this.activateKonamiCode();
        this.userInput = [];
      }
    });

    // Secret click sequence
    let clickCount = 0;
    $('.nav-logo').addEventListener('click', () => {
      clickCount++;
      if (clickCount >= 5) {
        this.activateRainbowMode();
        clickCount = 0;
      }
      setTimeout(() => clickCount = 0, 2000);
    });
  }

  activateKonamiCode() {
    // Gravity effect
    document.body.style.transform = 'rotate(180deg)';
    setTimeout(() => {
      document.body.style.transform = '';
    }, 3000);

    // Show message
    this.showMessage('🎉 Konami Code Activated! You found the secret!');
  }

  activateRainbowMode() {
    document.documentElement.style.filter = 'hue-rotate(0deg)';
    
    let hue = 0;
    const rainbow = setInterval(() => {
      hue += 5;
      document.documentElement.style.filter = `hue-rotate(${hue}deg)`;
      
      if (hue >= 360) {
        clearInterval(rainbow);
        document.documentElement.style.filter = '';
      }
    }, 50);

    this.showMessage('🌈 Rainbow Mode Activated!');
  }

  showMessage(text) {
    const message = document.createElement('div');
    message.textContent = text;
    message.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: var(--primary-gradient);
      color: white;
      padding: 20px 40px;
      border-radius: 10px;
      font-size: 18px;
      font-weight: bold;
      z-index: 10000;
      animation: messageIn 0.5s ease-out;
    `;

    document.body.appendChild(message);
    
    setTimeout(() => {
      message.remove();
    }, 3000);
  }
}

// ===== DROPDOWN CATEGORY SYSTEM =====
class DropdownCategorySystem {
  constructor() {
    this.categoryHeaders = $$('.category-header');
    this.categorySections = $$('.category-section');
    this.addProjectButtons = $$('.add-project-btn-small');
  }

  init() {
    this.bindEvents();
    this.initializeState();
  }

  bindEvents() {
    // Category header click to toggle dropdown
    this.categoryHeaders.forEach(header => {
      header.addEventListener('click', () => {
        this.toggleCategory(header);
      });
    });

    // Add project buttons for specific categories
    this.addProjectButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        const category = button.getAttribute('data-category');
        this.showAddProjectModal(category);
      });
    });

    // Keyboard navigation
    this.categoryHeaders.forEach(header => {
      header.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggleCategory(header);
        }
      });
    });
  }

  initializeState() {
    // All categories start collapsed - user can expand them manually
    console.log('🎯 Categories initialized in collapsed state');
    
    console.log(`🎯 Found ${this.categorySections.length} categories:`, 
      Array.from(this.categorySections).map(section => 
        section.querySelector('.category-title')?.textContent
      )
    );
  }

  toggleCategory(header) {
    const categorySection = header.closest('.category-section');
    const isExpanded = categorySection.classList.contains('expanded');
    
    if (isExpanded) {
      this.collapseCategory(categorySection);
    } else {
      this.expandCategory(categorySection);
    }
  }

  expandCategory(categorySection) {
    categorySection.classList.add('expanded');
    
    // Animate project cards in with stagger
    const projectCards = categorySection.querySelectorAll('.project-card');
    projectCards.forEach((card, index) => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px) scale(0.95)';
      
      setTimeout(() => {
        card.style.transition = 'all 0.4s ease-out';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0) scale(1)';
      }, 200 + (index * 100));
    });

    // Add expanded animation effect
    this.addExpandEffect(categorySection);
  }

  collapseCategory(categorySection) {
    const projectCards = categorySection.querySelectorAll('.project-card');
    
    // Animate cards out first
    projectCards.forEach((card, index) => {
      setTimeout(() => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(-10px) scale(0.95)';
      }, index * 50);
    });

    // Then collapse the section
    setTimeout(() => {
      categorySection.classList.remove('expanded');
    }, 200);
  }

  addExpandEffect(categorySection) {
    // Create expanding circle effect
    const effect = document.createElement('div');
    effect.className = 'expand-effect';
    effect.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 0;
      height: 0;
      background: radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      pointer-events: none;
      z-index: 0;
    `;
    
    const header = categorySection.querySelector('.category-header');
    header.appendChild(effect);
    
    // Animate the effect
    effect.style.transition = 'all 0.6s ease-out';
    setTimeout(() => {
      effect.style.width = '200px';
      effect.style.height = '200px';
    }, 10);
    
    // Remove after animation
    setTimeout(() => {
      effect.remove();
    }, 600);
  }

  // Method to add new project to specific category
  addProjectToCategory(projectData, category) {
    const categorySection = $(`.category-section .category-header[data-category="${category}"]`)?.closest('.category-section');
    if (!categorySection) {
      console.error('Category not found:', category);
      return;
    }

    const projectsGrid = categorySection.querySelector('.projects-grid');
    const projectHTML = this.createProjectHTML(projectData);
    
    projectsGrid.insertAdjacentHTML('beforeend', projectHTML);
    
    // Update project count
    this.updateCategoryCount(category);
    
    // Ensure category is expanded to show new project
    if (!categorySection.classList.contains('expanded')) {
      this.expandCategory(categorySection);
    }
    
    // Animate new project in
    const newProject = projectsGrid.lastElementChild;
    newProject.style.opacity = '0';
    newProject.style.transform = 'scale(0.8) translateY(30px)';
    
    setTimeout(() => {
      newProject.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
      newProject.style.opacity = '1';
      newProject.style.transform = 'scale(1) translateY(0)';
    }, 100);
    
    // Add success effect
    this.showSuccessEffect(newProject);
    
    console.log(`✨ New ${category} project added successfully!`);
  }

  updateCategoryCount(category) {
    const categorySection = $(`.category-header[data-category="${category}"]`)?.closest('.category-section');
    if (!categorySection) return;
    
    const projectCards = categorySection.querySelectorAll('.project-card');
    const countElement = categorySection.querySelector('.project-count');
    const count = projectCards.length;
    
    if (countElement) {
      countElement.textContent = `${count} project${count !== 1 ? 's' : ''}`;
      
      // Add update animation
      countElement.style.transform = 'scale(1.2)';
      countElement.style.background = 'var(--primary-gradient)';
      countElement.style.color = 'var(--white)';
      
      setTimeout(() => {
        countElement.style.transform = 'scale(1)';
        countElement.style.background = 'rgba(255, 255, 255, 0.05)';
        countElement.style.color = 'var(--gray-500)';
      }, 300);
    }
  }

  showSuccessEffect(element) {
    // Create success ripple effect
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: radial-gradient(circle, rgba(34, 197, 94, 0.3) 0%, transparent 70%);
      border-radius: inherit;
      pointer-events: none;
      z-index: 10;
      animation: successRipple 0.6s ease-out;
    `;
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
  }

  showAddProjectModal(category = null) {
    // Delegate to the project manager
    if (window.showAddProjectModal) {
      window.showAddProjectModal(category);
    }
  }

  createProjectHTML(data) {
    const tagColors = {
      entertainment: 'entertainment-tag',
      web: 'web-tag',
      tools: 'tools-tag',
      ai: 'ai-tag',
      mobile: 'mobile-tag'
    };

    const tagClass = tagColors[data.category] || '';
    
    return `
      <div class="project-card">
        <div class="project-image">
          <div class="project-overlay">
            <div class="project-links">
              <a href="${data.url || '#'}" ${data.url ? 'target="_blank"' : ''} class="project-link" title="Visit Project">
                <i class="fas fa-external-link-alt"></i>
              </a>
              <a href="${data.github || '#'}" class="project-link" title="View Code">
                <i class="fab fa-github"></i>
              </a>
            </div>
          </div>
          <div class="project-placeholder${data.iconClass ? ' ' + data.iconClass : ''}">
            <i class="${data.icon || 'fas fa-code'}"></i>
          </div>
        </div>
        <div class="project-info">
          <div class="project-tags">
            ${data.tags.map(tag => `<span class="tag ${tagClass}">${tag}</span>`).join('')}
          </div>
          <h3 class="project-title">${data.title}</h3>
          <p class="project-description">${data.description}</p>
          ${data.stats ? `
            <div class="project-stats">
              ${data.stats.map(stat => `
                <span class="stat">
                  <i class="${stat.icon}"></i>
                  <span>${stat.text}</span>
                </span>
              `).join('')}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }
}

// ===== PROJECT MANAGEMENT UTILITIES =====
class ProjectManager {
  constructor() {
    this.categorySystem = null;
  }

  init(categorySystem) {
    this.categorySystem = categorySystem;
    this.setupGlobalFunctions();
  }

  setupGlobalFunctions() {
    // Make functions globally available for easy project management
    window.addProject = (projectData) => {
      this.categorySystem.addProjectToCategory(projectData, projectData.category);
    };

    window.showAddProjectModal = (category = null) => {
      this.showAddProjectForm(category);
    };

    // Example project data structure for documentation
    window.exampleProject = {
      title: "My Awesome Project",
      description: "Description of what this project does and why it's amazing.",
      category: "web", // entertainment, web, tools, ai, mobile
      tags: ["React", "TypeScript", "API"],
      icon: "fas fa-rocket",
      iconClass: "custom-icon-class", // optional
      url: "https://myproject.com",
      github: "https://github.com/username/repo",
      stats: [
        { icon: "fas fa-star", text: "Featured" },
        { icon: "fas fa-download", text: "1K Downloads" }
      ]
    };

    // Helper function to expand/collapse categories
    window.toggleCategory = (categoryName) => {
      const header = $(`.category-header[data-category="${categoryName}"]`);
      if (header) {
        this.categorySystem.toggleCategory(header);
      }
    };

    // Helper to expand all categories
    window.expandAllCategories = () => {
      $$('.category-section').forEach(section => {
        if (!section.classList.contains('expanded')) {
          this.categorySystem.expandCategory(section);
        }
      });
    };

    // Helper to collapse all categories
    window.collapseAllCategories = () => {
      $$('.category-section').forEach(section => {
        if (section.classList.contains('expanded')) {
          this.categorySystem.collapseCategory(section);
        }
      });
    };
  }

  showAddProjectForm(preselectedCategory = null) {
    const formHTML = `
      <div id="add-project-modal" class="modal-overlay">
        <div class="modal-content">
          <div class="modal-header">
            <h3>${preselectedCategory ? `Add ${this.getCategoryDisplayName(preselectedCategory)} Project` : 'Add New Project'}</h3>
            <button class="modal-close" onclick="closeAddProjectModal()">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <form id="add-project-form" class="add-project-form">
            <div class="form-group">
              <input type="text" id="project-title" required>
              <label for="project-title">Project Title</label>
            </div>
            <div class="form-group">
              <textarea id="project-description" required></textarea>
              <label for="project-description">Description</label>
            </div>
            <div class="form-group">
              <select id="project-category" required ${preselectedCategory ? 'data-preselected="' + preselectedCategory + '"' : ''}>
                <option value="">Select Category</option>
                <option value="entertainment" ${preselectedCategory === 'entertainment' ? 'selected' : ''}>🎮 Entertainment</option>
                <option value="web" ${preselectedCategory === 'web' ? 'selected' : ''}>🌐 Web Apps</option>
                <option value="tools" ${preselectedCategory === 'tools' ? 'selected' : ''}>🔧 Dev Tools</option>
                <option value="ai" ${preselectedCategory === 'ai' ? 'selected' : ''}>🧠 AI/ML</option>
                <option value="mobile" ${preselectedCategory === 'mobile' ? 'selected' : ''}>📱 Mobile</option>
              </select>
              <label for="project-category">Category</label>
            </div>
            <div class="form-group">
              <input type="text" id="project-tags" placeholder="e.g. React, JavaScript, API">
              <label for="project-tags">Technologies (comma-separated)</label>
            </div>
            <div class="form-group">
              <input type="url" id="project-url">
              <label for="project-url">Live URL (optional)</label>
            </div>
            <div class="form-group">
              <input type="url" id="project-github">
              <label for="project-github">GitHub URL (optional)</label>
            </div>
            <div class="form-actions">
              <button type="button" class="btn btn-secondary" onclick="closeAddProjectModal()">Cancel</button>
              <button type="submit" class="btn btn-primary">
                <i class="fas fa-plus"></i>
                Add to ${preselectedCategory ? this.getCategoryDisplayName(preselectedCategory) : 'Category'}
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);
    
    // Bind form submit
    $('#add-project-form').addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleFormSubmit();
    });

    // Add modal styles
    this.addModalStyles();
    
    // Animate in
    setTimeout(() => {
      $('#add-project-modal').classList.add('show');
    }, 10);

    // Focus first input
    setTimeout(() => {
      $('#project-title').focus();
    }, 200);
  }

  getCategoryDisplayName(category) {
    const names = {
      entertainment: 'Entertainment',
      web: 'Web Apps',
      tools: 'Dev Tools',
      ai: 'AI/ML',
      mobile: 'Mobile'
    };
    return names[category] || category;
  }

  handleFormSubmit() {
    const formData = {
      title: $('#project-title').value,
      description: $('#project-description').value,
      category: $('#project-category').value,
      tags: $('#project-tags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
      url: $('#project-url').value,
      github: $('#project-github').value,
      icon: this.getCategoryIcon($('#project-category').value)
    };

    // Add the project to the specific category
    this.categorySystem.addProjectToCategory(formData, formData.category);
    
    // Close modal
    this.closeModal();
    
    // Show success message
    this.showSuccessMessage(`${formData.title} added to ${this.getCategoryDisplayName(formData.category)}! 🎉`);
  }

  getCategoryIcon(category) {
    const icons = {
      entertainment: 'fas fa-gamepad',
      web: 'fas fa-globe',
      tools: 'fas fa-tools',
      ai: 'fas fa-brain',
      mobile: 'fas fa-mobile-alt'
    };
    return icons[category] || 'fas fa-code';
  }

  closeModal() {
    const modal = $('#add-project-modal');
    if (modal) {
      modal.classList.remove('show');
      setTimeout(() => modal.remove(), 300);
    }
  }

  addModalStyles() {
    if ($('#modal-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'modal-styles';
    styles.textContent = `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      
      .modal-overlay.show {
        opacity: 1;
        visibility: visible;
      }
      
      .modal-content {
        background: var(--glass-bg);
        border-radius: var(--border-radius-2xl);
        border: 1px solid rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(20px);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        overflow-y: auto;
        transform: scale(0.8);
        transition: transform 0.3s ease;
      }
      
      .modal-overlay.show .modal-content {
        transform: scale(1);
      }
      
      .modal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: var(--space-6);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      }
      
      .modal-header h3 {
        color: var(--white);
        margin: 0;
      }
      
      .modal-close {
        background: none;
        border: none;
        color: var(--gray-400);
        font-size: var(--font-size-xl);
        cursor: pointer;
        padding: var(--space-2);
        border-radius: var(--border-radius);
        transition: all var(--transition-base);
      }
      
      .modal-close:hover {
        color: var(--white);
        background: rgba(255, 255, 255, 0.1);
      }
      
      .add-project-form {
        padding: var(--space-6);
      }
      
      .add-project-form .form-group {
        margin-bottom: var(--space-6);
      }
      
      .add-project-form select {
        width: 100%;
        padding: var(--space-4);
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: var(--border-radius);
        color: var(--white);
        font-size: var(--font-size-base);
      }
      
      .add-project-form select option {
        background: var(--gray-900);
        color: var(--white);
      }
      
      .form-actions {
        display: flex;
        gap: var(--space-4);
        justify-content: flex-end;
        margin-top: var(--space-8);
      }
    `;
    document.head.appendChild(styles);
  }

  showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
      color: white;
      padding: var(--space-4) var(--space-6);
      border-radius: var(--border-radius-lg);
      font-weight: 600;
      z-index: 10001;
      transform: translateX(100%);
      transition: transform 0.3s ease;
      box-shadow: var(--shadow-lg);
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Global functions for easy access
window.closeAddProjectModal = () => {
  const modal = $('#add-project-modal');
  if (modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }
};

// ===== MAIN APPLICATION =====
class MagnicodeApp {
  constructor() {
    this.modules = [];
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.start());
    } else {
      this.start();
    }
  }

  start() {
    // Ensure page starts at top
    window.scrollTo(0, 0);
    
    // Initialize all modules
    this.modules = [
      new LoadingScreen(),
      new ParticlesSystem(),
      new Navigation(),
      new ScrollAnimations(),
      new FormHandler(),
      new CursorEffect(),
      new ThemeManager(),
      new PerformanceMonitor(),
      new EasterEggs(),
      new DropdownCategorySystem(),
      new ProjectManager()
    ];

    // Initialize each module
    this.modules.forEach(module => {
      try {
        module.init();
      } catch (error) {
        console.error(`Failed to initialize module:`, error);
      }
    });

    // Connect project manager with category system
    const projectManager = this.modules.find(m => m instanceof ProjectManager);
    const categorySystem = this.modules.find(m => m instanceof DropdownCategorySystem);
    if (projectManager && categorySystem) {
      projectManager.init(categorySystem);
    }

    // Additional setup
    this.setupAdditionalFeatures();
    
    console.log('%c🚀 Magnicode Initialized!', 'color: #667eea; font-size: 20px; font-weight: bold;');
    console.log('%cWelcome to the Magnicode experience! Built with ❤️ by the Carters', 'color: #f093fb; font-size: 14px;');
    console.log('%c💡 Pro Tip: Use addProject(projectData) to easily add new projects!', 'color: #22c55e; font-size: 12px;');
    console.log('%c📖 Check window.exampleProject for the data structure', 'color: #22c55e; font-size: 12px;');
  }

  setupAdditionalFeatures() {
    // Smooth scrolling for all internal links
    $$('a[href^="#"]').forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        if (href === '#') return;
        
        e.preventDefault();
        const target = $(href);
        if (target) {
          const offsetTop = target.offsetTop - 80;
          window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
          });
        }
      });
    });

    // Lazy loading for images
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.classList.add('loaded');
              imageObserver.unobserve(img);
            }
          }
        });
      });

      $$('img[data-src]').forEach(img => imageObserver.observe(img));
    }

    // Service worker registration
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
      @keyframes messageIn {
        from {
          opacity: 0;
          transform: translate(-50%, -50%) scale(0.8);
        }
        to {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
      
      [data-animate="fade-in"] {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
      }
      
      [data-animate="fade-in"].animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      [data-animate="slide-up"] {
        opacity: 0;
        transform: translateY(50px);
        transition: all 0.6s ease;
      }
      
      [data-animate="slide-up"].animate-in {
        opacity: 1;
        transform: translateY(0);
      }
      
      .form-input.error {
        border-bottom-color: #ef4444;
      }
      
      .form-input.success {
        border-bottom-color: #22c55e;
      }
    `;
    document.head.appendChild(style);
  }
}

// ===== INITIALIZE APPLICATION =====
const app = new MagnicodeApp();
app.init();

// ===== GLOBAL ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('Global error:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
});

// ===== UTILITY FUNCTIONS FOR PROJECT BACKGROUNDS =====
window.setProjectBackground = function(projectSelector, imagePath) {
  const projectCard = document.querySelector(projectSelector);
  if (projectCard && imagePath) {
    projectCard.setAttribute('data-bg', imagePath);
    projectCard.style.backgroundImage = `url('${imagePath}')`;
    console.log(`🎨 Background set for project: ${projectSelector} -> ${imagePath}`);
  } else {
    console.warn(`❌ Could not set background: ${projectSelector} or ${imagePath} not found`);
  }
};

// Helper to set background for project by title
window.setProjectBackgroundByTitle = function(projectTitle, imagePath) {
  const projectCards = document.querySelectorAll('.project-card');
  projectCards.forEach(card => {
    const titleElement = card.querySelector('.project-title');
    if (titleElement && titleElement.textContent.trim() === projectTitle) {
      card.setAttribute('data-bg', imagePath);
      card.style.backgroundImage = `url('${imagePath}')`;
      console.log(`🎨 Background set for "${projectTitle}" -> ${imagePath}`);
    }
  });
};

// ===== EXPORT FOR DEBUGGING =====
window.MagnicodeApp = app;