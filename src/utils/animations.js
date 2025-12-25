/**
 * Advanced Fly-to-Cart with Confetti Burst
 * - Indigo, Amber, and Pink particles to match brand theme
 * - Automatic Mobile/Desktop detection
 * - Physics-based particle explosion
 */

const COLORS = ['#6366f1', '#f59e0b', '#ec4899', '#10b981']; // Indigo, Amber, Pink, Green

const createParticles = (x, y) => {
  const particleCount = 12;
  const container = document.body;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    
    // Randomize shape (some squares like paper, some lines like clips)
    const isSquare = Math.random() > 0.5;
    
    Object.assign(particle.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: isSquare ? '8px' : '4px',
      height: isSquare ? '8px' : '12px',
      backgroundColor: color,
      borderRadius: isSquare ? '2px' : '4px',
      zIndex: '10000',
      pointerEvents: 'none',
      transition: 'all 0.6s cubic-bezier(0.12, 0, 0.39, 0)',
    });

    container.appendChild(particle);

    // Calculate random explosion direction
    const destinationX = (Math.random() - 0.5) * 150;
    const destinationY = (Math.random() - 0.5) * 150;
    const rotation = Math.random() * 540;

    requestAnimationFrame(() => {
      particle.style.transform = `translate(${destinationX}px, ${destinationY}px) rotate(${rotation}deg)`;
      particle.style.opacity = '0';
    });

    // Cleanup particles
    setTimeout(() => particle.remove(), 600);
  }
};

export const flyToCart = (event, desktopId = 'cart-icon', mobileId = 'cart-icon-mobile') => {
  const desktopIcon = document.getElementById(desktopId);
  const mobileIcon = document.getElementById(mobileId);
  const cartIcon = window.getComputedStyle(mobileIcon).display !== 'none' ? mobileIcon : desktopIcon;

  if (!cartIcon || !event) return;

  const cardElement = event.target.closest('.group');
  const imgElement = cardElement.querySelector('img');
  
  const imgRect = imgElement.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const flyer = imgElement.cloneNode();
  
  Object.assign(flyer.style, {
    position: 'fixed',
    zIndex: '9999',
    top: `${imgRect.top}px`,
    left: `${imgRect.left}px`,
    width: `${imgRect.width}px`,
    height: `${imgRect.height}px`,
    opacity: '1',
    pointerEvents: 'none',
    borderRadius: '1rem',
    transition: 'all 0.8s cubic-bezier(0.45, 0, 0.55, 1)',
    filter: 'blur(0px)',
  });

  document.body.appendChild(flyer);

  const diffX = cartRect.left - imgRect.left + (cartRect.width / 2) - (imgRect.width / 2);
  const diffY = cartRect.top - imgRect.top + (cartRect.height / 2) - (imgRect.height / 2);

  requestAnimationFrame(() => {
    flyer.style.transform = `translate(${diffX}px, ${diffY}px) rotate(360deg) scale(0.1)`;
    flyer.style.opacity = '0.3';
    flyer.style.filter = 'blur(1px)';
  });

  setTimeout(() => {
    flyer.remove();
    
    // Trigger the Particle Burst on impact!
    createParticles(cartRect.left + cartRect.width / 2, cartRect.top + cartRect.height / 2);
    
    // Cart Icon Bump
    cartIcon.classList.add('scale-125');
    setTimeout(() => cartIcon.classList.remove('scale-125'), 200);
  }, 800);
};