import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

let lenis: Lenis | null = null;

export const reducedMotion = () =>
	typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function initMotion() {
	gsap.registerPlugin(ScrollTrigger);
	if (reducedMotion()) return () => {};
	lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 0.95 });
	if (import.meta.env.DEV) Object.assign(window, { __lenis: lenis, __ST: ScrollTrigger });
	lenis.on('scroll', ScrollTrigger.update);
	const tick = (t: number) => lenis?.raf(t * 1000);
	gsap.ticker.add(tick);
	gsap.ticker.lagSmoothing(0);
	return () => {
		gsap.ticker.remove(tick);
		lenis?.destroy();
		lenis = null;
	};
}

export function scrollToId(id: string, offset = -8) {
	const el = document.getElementById(id);
	if (!el) return;
	if (lenis) lenis.scrollTo(el, { offset, duration: 1.4 });
	else el.scrollIntoView({ behavior: 'smooth' });
}

/** Run `play` once when `node` scrolls into view (IntersectionObserver is sturdier than
 * scroll-position maths while layout is still settling). */
function onceVisible(node: Element, play: () => void, margin = '0px 0px -12% 0px') {
	const io = new IntersectionObserver(
		(entries) => {
			if (entries.some((e) => e.isIntersecting)) {
				io.disconnect();
				play();
			}
		},
		{ rootMargin: margin }
	);
	io.observe(node);
	return () => io.disconnect();
}

/** Fade/rise children marked with [data-reveal] when the node scrolls into view. */
export function reveal(node: HTMLElement, opts: { y?: number; stagger?: number } = {}) {
	if (reducedMotion()) return;
	const items = node.querySelectorAll<HTMLElement>('[data-reveal]');
	const targets = items.length ? Array.from(items) : [node];
	gsap.set(targets, { y: opts.y ?? 36, autoAlpha: 0 });
	const stop = onceVisible(node, () =>
		gsap.to(targets, {
			y: 0,
			autoAlpha: 1,
			duration: 1.1,
			ease: 'power3.out',
			stagger: opts.stagger ?? 0.09,
			clearProps: 'transform,opacity,visibility'
		})
	);
	return {
		destroy: () => {
			stop();
			gsap.killTweensOf(targets);
			gsap.set(targets, { clearProps: 'transform,opacity,visibility' });
		}
	};
}

/** Split a heading into word spans that rise in sequence. Only for static text. */
export function splitWords(node: HTMLElement, opts: { delay?: number; scroll?: boolean } = {}) {
	if (reducedMotion()) return;
	const walk = (el: Node) => {
		for (const child of Array.from(el.childNodes)) {
			if (child.nodeType === 3) {
				const frag = document.createDocumentFragment();
				for (const part of (child.textContent ?? '').split(/([ \t\n]+)/)) {
					if (!part) continue;
					if (/^[ \t\n]+$/.test(part)) {
						frag.append(part);
						continue;
					}
					const outer = document.createElement('span');
					outer.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:top;padding-bottom:0.1em;margin-bottom:-0.1em';
					const inner = document.createElement('span');
					inner.className = 'w';
					inner.style.display = 'inline-block';
					inner.textContent = part;
					outer.append(inner);
					frag.append(outer);
				}
				child.replaceWith(frag);
			} else if (child.nodeType === 1 && (child as HTMLElement).tagName !== 'BR') walk(child);
		}
	};
	walk(node);
	const words = node.querySelectorAll('.w');
	gsap.set(words, { yPercent: 110, rotate: 3 });
	const play = () =>
		gsap.to(words, { yPercent: 0, rotate: 0, duration: 1.2, ease: 'power4.out', stagger: 0.06, delay: opts.delay ?? 0 });
	const stop = opts.scroll === false ? (play(), () => {}) : onceVisible(node, play);
	return {
		destroy: () => {
			stop();
			gsap.killTweensOf(words);
		}
	};
}
