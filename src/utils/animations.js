/**
 * Bubble Fly-to-Cart Animation
 * - Indigo, Amber, and Pink particles to match Artemon Joy brand
 * - Thumbnail transforms into a "bubble" (circle) during flight
 * - Removed rotation for a "still" gliding effect
 */

const COLORS = ['#2563eb', '#f59e0b', '#ec4899', '#10b981']; 

const createParticles = (x, y) => {
  const particleCount = 15;
  const container = document.body;

  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement('div');
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const isSquare = Math.random() > 0.5;
    
    Object.assign(particle.style, {
      position: 'fixed',
      left: `${x}px`,
      top: `${y}px`,
      width: isSquare ? '8px' : '4px',
      height: isSquare ? '8px' : '12px',
      backgroundColor: color,
      borderRadius: isSquare ? '2px' : '4px',
      zIndex: '100000', 
      pointerEvents: 'none',
      opacity: '1',
      transform: 'translate(0, 0)',
      transition: 'all 0.7s cubic-bezier(0.12, 0, 0.39, 0)',
    });

    container.appendChild(particle);

    void particle.offsetWidth; 

    const destinationX = (Math.random() - 0.5) * 200;
    const destinationY = (Math.random() - 0.5) * 200;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        particle.style.transform = `translate(${destinationX}px, ${destinationY}px)`;
        particle.style.opacity = '0';
      });
    });

    setTimeout(() => particle.remove(), 800);
  }
};

export const flyToCart = (event, desktopId = 'cart-icon', mobileId = 'cart-icon-mobile') => {
  // 1. Identify Target
  const isMobile = window.innerWidth < 768;
  const cartIcon = document.getElementById(isMobile ? mobileId : desktopId);

  if (!cartIcon || !event) return;

  // 2. Locate Image
  const cardElement = event.currentTarget.closest('.group') || document.querySelector('main');
  const imgElement = cardElement?.querySelector('img');
  
  if (!imgElement) return;

  const imgRect = imgElement.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  // 3. Create the Bubble Flyer
  const flyer = imgElement.cloneNode();
  
  Object.assign(flyer.style, {
    position: 'fixed',
    zIndex: '99999',
    top: `${imgRect.top}px`,
    left: `${imgRect.left}px`,
    width: `${imgRect.width}px`,
    height: `${imgRect.height}px`,
    opacity: '1',
    pointerEvents: 'none',
    // Bubble effect: Force circular shape and indigo border
    borderRadius: '50%',
    border: '3px solid #2563eb',
    boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
    objectFit: 'cover',
    backgroundColor: 'white',
    transition: 'all 0.9s cubic-bezier(0.45, 0, 0.55, 1)',
  });

  document.body.appendChild(flyer);

  // 4. Calculate Path
  const diffX = cartRect.left - imgRect.left + (cartRect.width / 2) - (imgRect.width / 2);
  const diffY = cartRect.top - imgRect.top + (cartRect.height / 2) - (imgRect.height / 2);

  // 5. Execute Still Glide (Removed rotation)
  requestAnimationFrame(() => {
    flyer.style.transform = `translate(${diffX}px, ${diffY}px) scale(0.1)`;
    flyer.style.opacity = '0.5';
  });

  // 6. Impact & Burst
  setTimeout(() => {
    flyer.remove();
    
    const finalCartRect = cartIcon.getBoundingClientRect();
    createParticles(
      finalCartRect.left + finalCartRect.width / 2, 
      finalCartRect.top + finalCartRect.height / 2
    );
    
    // Bounce effect on cart icon
    cartIcon.classList.add('scale-125');
    setTimeout(() => cartIcon.classList.remove('scale-125'), 200);
  }, 900);
};