import clsx from 'clsx'
import React, { RefObject, useEffect, useRef, useState } from 'react'

interface PopoverProps {
  children?: React.ReactNode
  triggerRef?: RefObject<HTMLElement>
  baseRef?: RefObject<HTMLElement>
  isVisible: boolean
  width: number
  height: number
  onClose: () => void
}

export interface PopoverOptions {
  content?: React.ReactNode
  triggerRef?: RefObject<HTMLElement>
  width: number
  height: number
}

export const Popover = React.forwardRef<HTMLElement, PopoverProps>(
  (
    { children, triggerRef, isVisible, onClose, baseRef, width, height },
    ref,
  ) => {
    const popoverRef =
      (ref as React.MutableRefObject<HTMLDivElement | null>) ||
      useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ top: 0, left: 0 })

    useEffect(() => {
      if (
        isVisible &&
        triggerRef?.current &&
        popoverRef?.current &&
        baseRef?.current
      ) {
        const triggerRect = triggerRef.current.getBoundingClientRect()
        const baseRect = baseRef.current.getBoundingClientRect()

        let top = triggerRect.top - baseRect.top - height
        let left = triggerRect.left - baseRect.left - width

        // Adjust top position if popover overflows the top of the app container
        if (top < 10) {
          top = 10
        }

        // Adjust left position if popover overflows the left side of the app container
        if (left < 0) {
          left = 0
        }

        // Ensure the popover is not positioned off the bottom or right of the app container
        if (top + height > baseRect.height) {
          top = baseRect.height - height
        }
        if (left + width > baseRect.width) {
          left = baseRect.width - width
        }

        setPosition({ top, left })
      }
    }, [isVisible, triggerRef, baseRef, width, height])

    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (!triggerRef) return null
        if (
          popoverRef.current &&
          !popoverRef.current.contains(event?.target as Node) &&
          triggerRef.current &&
          !triggerRef.current.contains(event?.target as Node)
        ) {
          onClose()
        }
      }

      if (isVisible) {
        document.addEventListener('mousedown', handleClickOutside)
      } else {
        document.removeEventListener('mousedown', handleClickOutside)
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }, [isVisible, onClose, triggerRef])

    return (
      <div
        ref={popoverRef}
        className={clsx([
          'popover-container',
          { visible: isVisible, hidden: !isVisible },
        ])}
        style={{
          top: position.top,
          left: position.left,
          width: width,
          height: height,
        }}
      >
        {children}
      </div>
    )
  },
)
