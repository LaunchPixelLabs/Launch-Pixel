"use client";

import React, {
    Children,
    cloneElement,
    forwardRef,
    isValidElement,
    ReactElement,
    ReactNode,
    RefObject,
    useEffect,
    useMemo,
    useRef
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface CardSwapProps {
    width?: number | string;
    height?: number | string;
    cardDistance?: number;
    verticalDistance?: number;
    skewAmount?: number;
    children: ReactNode;
}

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    customClass?: string;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(({ customClass, ...rest }, ref) => (
    <div
        ref={ref}
        {...rest}
        className={`absolute top-1/2 left-1/2 rounded-xl border border-white/20 bg-gray-950/80 backdrop-blur-md shadow-2xl [transform-style:preserve-3d] [will-change:transform] [backface-visibility:hidden] ${customClass ?? ''} ${rest.className ?? ''}`.trim()}
    />
));
Card.displayName = 'Card';

type CardRef = RefObject<HTMLDivElement | null>;
interface Slot {
    x: number;
    y: number;
    z: number;
    zIndex: number;
}

const makeSlot = (i: number, distX: number, distY: number, total: number): Slot => ({
    x: i * distX,
    y: -i * distY,
    z: -i * distX * 1.5,
    zIndex: total - i
});

const placeNow = (el: HTMLElement, slot: Slot, skew: number) =>
    gsap.set(el, {
        x: slot.x,
        y: slot.y,
        z: slot.z,
        xPercent: -50,
        yPercent: -50,
        skewY: skew,
        transformOrigin: 'center center',
        zIndex: slot.zIndex,
        force3D: true
    });

const CardSwap: React.FC<CardSwapProps> = ({
    width = 500,
    height = 400,
    cardDistance = 60,
    verticalDistance = 70,
    skewAmount = 6,
    children
}) => {
    const childArr = useMemo(() => Children.toArray(children) as ReactElement<CardProps>[], [children]);
    const refs = useMemo<CardRef[]>(() => childArr.map(() => React.createRef<HTMLDivElement>()), [childArr.length]);

    const container = useRef<HTMLDivElement>(null);
    const wrapper = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!container.current || !wrapper.current || refs.length < 2) return;

        // Initial Placement
        const total = refs.length;
        refs.forEach((r, i) => {
            if (r.current) {
                placeNow(r.current, makeSlot(i, cardDistance, verticalDistance, total), skewAmount)
            }
        });

        // Create Main Timeline
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: wrapper.current,
                start: "top top",
                end: `+=${total * 100}%`, // Scroll distance proportional to number of cards
                scrub: 1, // Smooth scrubbing
                pin: true,
                // markers: true, // Uncomment for debugging
            }
        });

        // Build timeline steps
        // We want to animate card 0 to back, then card 1 to back, etc.
        // For a stack of 3:
        // State 0: [0, 1, 2]
        // Step 1: 0 drops and goes to back -> [1, 2, 0]
        // Step 2: 1 drops and goes to back -> [2, 0, 1]
        // ...

        // Virtual order array to track z-indices
        let order = Array.from({ length: total }, (_, i) => i);

        // Loop through cards to animate them cycling
        // We animate N-1 times to cycle through the stack
        for (let i = 0; i < total; i++) {
            const frontIdx = order[0];
            const restIdxs = order.slice(1);
            const frontEl = refs[frontIdx].current;

            if (!frontEl) continue;

            const stepTl = gsap.timeline();

            // 1. Drop front card
            stepTl.to(frontEl, {
                y: '+=500',
                duration: 1,
                ease: "power1.inOut"
            });

            // 2. Move others forward
            // We use a label to sync these movements
            stepTl.addLabel('moveForward', "<+=0.2");

            restIdxs.forEach((idx, pos) => {
                const el = refs[idx].current;
                if (el) {
                    const slot = makeSlot(pos, cardDistance, verticalDistance, total);
                    // We don't change zIndex immediately to avoid flickering, usually handled by checking order
                    stepTl.to(el, {
                        x: slot.x,
                        y: slot.y,
                        z: slot.z,
                        zIndex: slot.zIndex, // GSAP can tween zIndex if it's an integer, but safe to set
                        duration: 1,
                        ease: "power1.inOut"
                    }, 'moveForward');
                }
            });

            // 3. Return front card to back
            const backSlot = makeSlot(total - 1, cardDistance, verticalDistance, total);
            stepTl.to(frontEl, {
                x: backSlot.x,
                y: backSlot.y,
                z: backSlot.z,
                zIndex: backSlot.zIndex,
                duration: 1,
                ease: "power1.inOut"
            }, ">-0.5");

            // Update order for next iteration logic (though GSAP records the timeline upfront)
            // We actually need to build the *entire* timeline based on this logic repeatedly.
            // Since we are building a static timeline, we can just manipulate the 'order' array locally in this loop
            order = [...restIdxs, frontIdx];

            tl.add(stepTl);
        }


        return () => {
            ScrollTrigger.getAll().forEach(t => t.kill());
        };

    }, [cardDistance, verticalDistance, skewAmount, refs]);

    const rendered = childArr.map((child, i) =>
        isValidElement<CardProps>(child)
            ? cloneElement(child, {
                key: i,
                ref: refs[i],
                style: { width, height, ...(child.props.style ?? {}) },
            } as CardProps & React.RefAttributes<HTMLDivElement>)
            : child
    );

    return (
        // Wrapper for Pinning
        <div ref={wrapper} className="w-full h-full flex items-center justify-center relative">
            <div
                ref={container}
                className="relative transform origin-center perspective-[900px] preserve-3d"
                style={{ width, height }}
            >
                <div className="absolute inset-0 preserve-3d">
                    {rendered}
                </div>
            </div>
        </div>
    );
};

export default CardSwap;
