'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';

export type PillNavItem = {
  label: string;
  href?: string;
  ariaLabel?: string;
  onClick?: (e: React.MouseEvent) => void;
};

export interface PillNavProps {
  logo: string;
  logoAlt?: string;
  items: PillNavItem[];
  activeHref?: string;
  className?: string;
  ease?: string;
  baseColor?: string;
  pillColor?: string;
  hoveredPillTextColor?: string;
  pillTextColor?: string;
  logoBg?: string;
  onMobileMenuClick?: () => void;
  initialLoadAnimation?: boolean;
}

const PillNav: React.FC<PillNavProps> = ({
  logo,
  logoAlt = 'Logo',
  items,
  activeHref,
  className = '',
  ease = 'power3.easeOut',
  baseColor = '#fff',
  pillColor = '#120F17',
  hoveredPillTextColor = '#120F17',
  pillTextColor,
  logoBg,
  onMobileMenuClick,
  initialLoadAnimation = true
}) => {
  const resolvedPillTextColor = pillTextColor ?? baseColor;
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const circleRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const tlRefs = useRef<Array<gsap.core.Timeline | null>>([]);
  const activeTweenRefs = useRef<Array<gsap.core.Tween | null>>([]);
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const logoTweenRef = useRef<gsap.core.Tween | null>(null);
  const hamburgerRef = useRef<HTMLButtonElement | null>(null);
  const mobileMenuRef = useRef<HTMLDivElement | null>(null);
  const navItemsRef = useRef<HTMLDivElement | null>(null);
  const logoRef = useRef<HTMLAnchorElement | HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const layout = () => {
      circleRefs.current.forEach((circle) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement as HTMLElement;
        const rect = pill.getBoundingClientRect();
        const { width: w, height: h } = rect;
        const R = ((w * w) / 4 + h * h) / (2 * h);
        const D = Math.ceil(2 * R) + 2;
        const delta = Math.ceil(R - Math.sqrt(Math.max(0, R * R - (w * w) / 4))) + 1;
        const originY = D - delta;

        circle.style.width = `${D}px`;
        circle.style.height = `${D}px`;
        circle.style.bottom = `-${delta}px`;

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`
        });

        const label = pill.querySelector<HTMLElement>('.pill-label');
        const white = pill.querySelector<HTMLElement>('.pill-label-hover');

        if (label) gsap.set(label, { y: 0 });
        if (white) gsap.set(white, { y: h + 12, opacity: 0 });

        const index = circleRefs.current.indexOf(circle);
        if (index === -1) return;

        tlRefs.current[index]?.kill();
        const tl = gsap.timeline({ paused: true });

        tl.to(circle, { scale: 1.2, xPercent: -50, duration: 2, ease, overwrite: 'auto' }, 0);

        if (label) {
          tl.to(label, { y: -(h + 8), duration: 2, ease, overwrite: 'auto' }, 0);
        }

        if (white) {
          gsap.set(white, { y: Math.ceil(h + 100), opacity: 0 });
          tl.to(white, { y: 0, opacity: 1, duration: 2, ease, overwrite: 'auto' }, 0);
        }

        tlRefs.current[index] = tl;
      });
    };

    layout();

    const onResize = () => layout();
    window.addEventListener('resize', onResize);

    if (document.fonts) {
      document.fonts.ready.then(layout).catch(() => { });
    }

    const menu = mobileMenuRef.current;
    if (menu) {
      gsap.set(menu, { visibility: 'hidden', opacity: 0, scaleY: 1, y: 0 });
    }

    if (initialLoadAnimation) {
      const logo = logoRef.current;
      const navItems = navItemsRef.current;

      if (logo) {
        gsap.set(logo, { scale: 0 });
        gsap.to(logo, {
          scale: 1,
          duration: 0.6,
          ease
        });
      }

      if (navItems) {
        gsap.set(navItems, { width: 0, overflow: 'hidden' });
        gsap.to(navItems, {
          width: 'auto',
          duration: 0.6,
          ease
        });
      }
    }

    return () => window.removeEventListener('resize', onResize);
  }, [items, ease, initialLoadAnimation]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isCollapsed = isScrolled;

  useEffect(() => {
    const container = containerRef.current;
    const navItems = navItemsRef.current;

    if (!container || !navItems) return;
    if (typeof window === 'undefined' || window.innerWidth < 768) return;

    if (isCollapsed) {
      gsap.to(navItems, {
        width: 0,
        opacity: 0,
        marginLeft: 0,
        duration: 0.5,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
      gsap.to(container, {
        left: '0',
        xPercent: 0,
        x: 0,
        duration: 0.5,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
    } else {
      gsap.to(navItems, {
        width: 'auto',
        opacity: 1,
        marginLeft: '0.5rem',
        duration: 0.5,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
      gsap.to(container, {
        left: '50%',
        xPercent: -50,
        x: 0,
        duration: 0.5,
        ease: 'power3.inOut',
        overwrite: 'auto'
      });
    }
  }, [isCollapsed]);

  const handleEnter = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(tl.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLeave = (i: number) => {
    const tl = tlRefs.current[i];
    if (!tl) return;
    activeTweenRefs.current[i]?.kill();
    activeTweenRefs.current[i] = tl.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const handleLogoEnter = () => {
    const img = logoImgRef.current;
    if (!img) return;
    logoTweenRef.current?.kill();
    gsap.set(img, { rotate: 0 });
    logoTweenRef.current = gsap.to(img, {
      rotate: 360,
      duration: 0.2,
      ease,
      overwrite: 'auto'
    });
  };

  const toggleMobileMenu = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);

    const hamburger = hamburgerRef.current;
    const menu = mobileMenuRef.current;

    if (hamburger) {
      const lines = hamburger.querySelectorAll('.hamburger-line');
      if (newState) {
        gsap.to(lines[0], { rotation: 45, y: 3, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: -45, y: -3, duration: 0.3, ease });
      } else {
        gsap.to(lines[0], { rotation: 0, y: 0, duration: 0.3, ease });
        gsap.to(lines[1], { rotation: 0, y: 0, duration: 0.3, ease });
      }
    }

    if (menu) {
      if (newState) {
        gsap.set(menu, { visibility: 'visible' });
        gsap.fromTo(
          menu,
          { opacity: 0, y: 10, scaleY: 1 },
          {
            opacity: 1,
            y: 0,
            scaleY: 1,
            duration: 0.3,
            ease,
            transformOrigin: 'top center'
          }
        );
      } else {
        gsap.to(menu, {
          opacity: 0,
          y: 10,
          scaleY: 1,
          duration: 0.2,
          ease,
          transformOrigin: 'top center',
          onComplete: () => {
            gsap.set(menu, { visibility: 'hidden' });
          }
        });
      }
    }

    onMobileMenuClick?.();
  };

  const isExternalLink = (href?: string) =>
    href &&
    (href.startsWith('http://') ||
      href.startsWith('https://') ||
      href.startsWith('//') ||
      href.startsWith('mailto:') ||
      href.startsWith('tel:') ||
      href.startsWith('#'));

  const isRouterLink = (href?: string) => href && !isExternalLink(href);

  const cssVars = {
    ['--base' as string]: baseColor,
    ['--pill-bg' as string]: pillColor,
    ['--hover-text' as string]: hoveredPillTextColor,
    ['--pill-text' as string]: resolvedPillTextColor,
    ['--nav-h' as string]: '42px',
    ['--logo-size' as string]: '70px',
    ['--pill-pad-x' as string]: '18px',
    ['--pill-gap' as string]: '3px'
  } as React.CSSProperties;

  return (
    <>
      <style>{`
        .pill-nav-container {
          position: absolute; top: 1em; z-index: 1000; width: 100%; left: 0;
        }
        @media (min-width: 768px) {
          .pill-nav-container { width: auto; left: 50%; transform: translateX(-50%); }
          .pill-nav-inner { width: max-content !important; justify-content: flex-start !important; padding: 0 !important; }
          .pill-nav-items { display: flex !important; }
          .pill-nav-hamburger { display: none !important; }
          .pill-nav-mobile-menu { display: none !important; }
        }
        .pill-nav-inner { width: 100%; display: flex; align-items: center; justify-content: space-between; box-sizing: border-box; padding: 0 1rem; }
        .pill-nav-logo { border-radius: 9999px; padding: 0.5rem; display: inline-flex; align-items: center; justify-content: center; overflow: hidden; text-decoration: none; }
        .pill-nav-items { position: relative; align-items: center; border-radius: 9999px; display: none; margin-left: 0.5rem; overflow: hidden; }
        .pill-nav-ul { list-style: none; display: flex; align-items: stretch; margin: 0; padding: 3px; height: 100%; }
        .pill-nav-li { display: flex; height: 100%; }
        .pill-nav-link { position: relative; overflow: hidden; display: inline-flex; align-items: center; justify-content: center; height: 100%; text-decoration: none; border-radius: 9999px; box-sizing: border-box; font-weight: 600; font-size: 16px; line-height: 0; text-transform: uppercase; letter-spacing: 0.2px; white-space: nowrap; cursor: pointer; padding: 0; border: 0; outline: none; }
        .pill-nav-hamburger { border-radius: 9999px; border: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.25rem; cursor: pointer; padding: 0; position: relative; }
        .hamburger-line { width: 1rem; height: 2px; border-radius: 0.25rem; transform-origin: center; transition: all 10ms cubic-bezier(0.25, 0.1, 0.25, 1); }
        .pill-nav-mobile-menu { position: absolute; top: 3em; left: 1rem; right: 1rem; border-radius: 27px; box-shadow: 0 8px 32px rgba(0,0,0,0.12); z-index: 998; transform-origin: top; }
        .pill-nav-mobile-ul { list-style: none; margin: 0; padding: 3px; display: flex; flex-direction: column; gap: 3px; }
        .pill-nav-mobile-link { display: block; padding: 0.75rem 1rem; font-size: 16px; font-weight: 500; border-radius: 50px; transition: all 200ms cubic-bezier(0.25, 0.1, 0.25, 1); border: 0; text-align: left; text-decoration: none; cursor: pointer; }
        .hover-circle { position: absolute; left: 50%; bottom: 0; border-radius: 9999px; z-index: 1; display: block; pointer-events: none; }
        .label-stack { position: relative; display: inline-block; line-height: 1; z-index: 2; }
        .pill-label { position: relative; z-index: 2; display: inline-block; line-height: 1; }
        .pill-label-hover { position: absolute; left: 0; top: 0; z-index: 3; display: inline-block; }
        .active-indicator { position: absolute; left: 50%; bottom: -6px; transform: translateX(-50%); width: 0.75rem; height: 0.75rem; border-radius: 9999px; z-index: 4; }
      `}</style>
      <div
        className={`pill-nav-container ${className}`}
        ref={containerRef}
      >
        <nav
          className="pill-nav-inner"
          aria-label="Primary"
          style={cssVars}
        >
          {isRouterLink(items?.[0]?.href) ? (
            <Link
              href={items[0].href!}
              aria-label="Home"
              onMouseEnter={handleLogoEnter}
              role="menuitem"
              ref={(el) => {
                logoRef.current = el as unknown as HTMLElement;
              }}
              className="pill-nav-logo"
              style={{
                width: 'var(--logo-size)',
                height: 'var(--logo-size)',
                background: logoBg || 'var(--base, #000)'
              }}
            >
              <img src={logo} alt={logoAlt} ref={logoImgRef} style={{ width: '70%', height: '70%', objectFit: 'contain', display: 'block' }} />
            </Link>
          ) : (
            <a
              href={items?.[0]?.href || '#'}
              aria-label="Home"
              onMouseEnter={handleLogoEnter}
              ref={(el) => {
                logoRef.current = el as unknown as HTMLElement;
              }}
              className="pill-nav-logo"
              style={{
                width: 'var(--logo-size)',
                height: 'var(--logo-size)',
                background: logoBg || 'var(--base, #ffed65ff)'
              }}
            >
              <img src={logo} alt={logoAlt} ref={logoImgRef} style={{ width: '70%', height: '70%', objectFit: 'contain', display: 'block' }} />
            </a>
          )}

          <div
            ref={navItemsRef}
            className="pill-nav-items"
            style={{
              height: 'var(--nav-h)',
              background: 'var(--base, #ffce39ff)'
            }}
          >
            <ul
              role="menubar"
              className="pill-nav-ul"
              style={{ gap: 'var(--pill-gap)' }}
            >
              {items.map((item, i) => {
                const isActive = activeHref === item.href;

                const pillStyle: React.CSSProperties = {
                  background: isActive ? '#ffce39ff' : 'var(--pill-bg, #fff)',
                  color: isActive ? '#120F17' : 'var(--pill-text, var(--base, #000))',
                  paddingLeft: 'var(--pill-pad-x)',
                  paddingRight: 'var(--pill-pad-x)'
                };

                const PillContent = (
                  <>
                    <span
                      className="hover-circle"
                      style={{
                        background: 'var(--base, #000)',
                        willChange: 'transform'
                      }}
                      aria-hidden="true"
                      ref={(el) => {
                        circleRefs.current[i] = el;
                      }}
                    />
                    <span className="label-stack">
                      <span
                        className="pill-label"
                        style={{ willChange: 'transform' }}
                      >
                        {item.label}
                      </span>
                      <span
                        className="pill-label-hover"
                        style={{
                          color: 'var(--hover-text, #fff)',
                          willChange: 'transform, opacity'
                        }}
                        aria-hidden="true"
                      >
                        {item.label}
                      </span>
                    </span>
                    {isActive && (
                      <span
                        className="active-indicator"
                        style={{ background: 'var(--base, #000)' }}
                        aria-hidden="true"
                      />
                    )}
                  </>
                );

                return (
                  <li key={item.label} role="none" className="pill-nav-li">
                    {item.onClick ? (
                      <button
                        role="menuitem"
                        onClick={(e) => {
                          item.onClick!(e);
                          setIsMobileMenuOpen(false);
                        }}
                        className="pill-nav-link"
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                      >
                        {PillContent}
                      </button>
                    ) : isRouterLink(item.href) ? (
                      <Link
                        role="menuitem"
                        href={item.href!}
                        className="pill-nav-link"
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                      >
                        {PillContent}
                      </Link>
                    ) : (
                      <a
                        role="menuitem"
                        href={item.href || '#'}
                        className="pill-nav-link"
                        style={pillStyle}
                        aria-label={item.ariaLabel || item.label}
                        onMouseEnter={() => handleEnter(i)}
                        onMouseLeave={() => handleLeave(i)}
                      >
                        {PillContent}
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          <button
            ref={hamburgerRef}
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
            className="pill-nav-hamburger"
            style={{
              width: 'var(--nav-h)',
              height: 'var(--nav-h)',
              background: 'var(--base, #000)'
            }}
          >
            <span
              className="hamburger-line"
              style={{ background: 'var(--pill-bg, #fff)' }}
            />
            <span
              className="hamburger-line"
              style={{ background: 'var(--pill-bg, #fff)' }}
            />
          </button>
        </nav>

        <div
          ref={mobileMenuRef}
          className="pill-nav-mobile-menu"
          style={{
            ...cssVars,
            background: 'var(--base, #f0f0f0)'
          }}
        >
          <ul className="pill-nav-mobile-ul">
            {items.map((item) => {
              const defaultStyle: React.CSSProperties = {
                background: 'var(--pill-bg, #fff)',
                color: 'var(--pill-text, #000)'
              };
              const hoverIn = (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.background = 'var(--base, #000)';
                e.currentTarget.style.color = 'var(--hover-text, #fff)';
              };
              const hoverOut = (e: React.MouseEvent<HTMLElement>) => {
                e.currentTarget.style.background = 'var(--pill-bg, #fff)';
                e.currentTarget.style.color = 'var(--pill-text, #000)';
              };

              return (
                <li key={item.label}>
                  {item.onClick ? (
                    <button
                      className="pill-nav-mobile-link"
                      style={{ ...defaultStyle, width: '100%' }}
                      onMouseEnter={hoverIn}
                      onMouseLeave={hoverOut}
                      onClick={(e) => {
                        item.onClick!(e);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      {item.label}
                    </button>
                  ) : isRouterLink(item.href) ? (
                    <Link
                      href={item.href!}
                      className="pill-nav-mobile-link"
                      style={defaultStyle}
                      onMouseEnter={hoverIn}
                      onMouseLeave={hoverOut}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <a
                      href={item.href || '#'}
                      className="pill-nav-mobile-link"
                      style={defaultStyle}
                      onMouseEnter={hoverIn}
                      onMouseLeave={hoverOut}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.label}
                    </a>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </>
  );
};

export default PillNav;
