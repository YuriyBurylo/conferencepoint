import React, { useEffect, useRef, useState } from 'react';
import { buildCurrentPageShareData, buildShareTargets } from '../../utils/shareConference';
import ShareIcon from '../ShareIcon/ShareIcon';
import styles from './FloatingShare.module.css';
import { useLanguage } from '../../context/useLanguage';

const EDGE_GAP = 14;

function FloatingShare() {
    const [isOpen, setIsOpen] = useState(false);
    const [position, setPosition] = useState(null);
    const containerRef = useRef(null);
    const dragState = useRef(null);
    const movedRef = useRef(false);
    const { t } = useLanguage();
    const shareData = buildCurrentPageShareData();
    const targets = buildShareTargets(shareData);

    useEffect(() => {
        if (!isOpen) return undefined;

        const handleDocumentPointerDown = (event) => {
            if (!containerRef.current?.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('pointerdown', handleDocumentPointerDown);
        return () => document.removeEventListener('pointerdown', handleDocumentPointerDown);
    }, [isOpen]);

    const clampPosition = (left, top, width, height) => ({
        left: Math.min(Math.max(EDGE_GAP, left), window.innerWidth - width - EDGE_GAP),
        top: Math.min(Math.max(EDGE_GAP, top), window.innerHeight - height - EDGE_GAP)
    });

    const handlePointerMove = (event) => {
        if (!dragState.current || event.pointerId !== dragState.current.pointerId) return;

        const { startX, startY, startLeft, startTop, width, height } = dragState.current;
        const deltaX = event.clientX - startX;
        const deltaY = event.clientY - startY;

        if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) movedRef.current = true;
        setPosition(clampPosition(startLeft + deltaX, startTop + deltaY, width, height));
    };

    const handlePointerUp = (event) => {
        if (!dragState.current || event.pointerId !== dragState.current.pointerId) return;
        dragState.current.captureElement.releasePointerCapture(event.pointerId);
        dragState.current = null;
    };

    const handlePointerDown = (event) => {
        const rect = containerRef.current.getBoundingClientRect();
        movedRef.current = false;
        setIsOpen(false);
        dragState.current = {
            pointerId: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            startLeft: rect.left,
            startTop: rect.top,
            width: rect.width,
            height: rect.height,
            captureElement: event.currentTarget
        };
        event.currentTarget.setPointerCapture(event.pointerId);
    };

    const handleToggle = () => {
        if (movedRef.current) {
            movedRef.current = false;
            return;
        }
        setIsOpen(!isOpen);
    };

    return (
        <div
            ref={containerRef}
            className={styles.floatingShare}
            style={position ? {
                left: `${position.left}px`,
                top: `${position.top}px`,
                right: 'auto',
                bottom: 'auto'
            } : undefined}
        >
            {isOpen && (
                <div className={styles.sharePanel}>
                    {targets.map(target => (
                        <a key={target.id} href={target.href} target="_blank" rel="noopener noreferrer">
                            {target.label}
                        </a>
                    ))}
                </div>
            )}
            <button
                className={styles.shareButton}
                onClick={handleToggle}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
            >
                <ShareIcon className={styles.shareIcon} />
                <span className={styles.shareLabel}>{t('common.share')}</span>
            </button>
        </div>
    );
}

export default FloatingShare;
