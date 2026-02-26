'use client'

import { useState, useCallback } from 'react'

type VisualElement = {
  id: string
  type: 'chart' | 'table' | 'timeline' | 'gallery' | 'code' | 'form' | 'map' | 'calculator'
  data: any
  layout?: 'grid' | 'list' | 'card' | 'full'
}

export function useVisualLayout() {
  const [elements, setElements] = useState<VisualElement[]>([])
  const [isOpen, setIsOpen] = useState(false)

  const addElement = useCallback((element: Omit<VisualElement, 'id'>) => {
    const newElement = {
      ...element,
      id: Math.random().toString(36).substring(7)
    }
    setElements(prev => [...prev, newElement])
    setIsOpen(true)
  }, [])

  const removeElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id))
    if (elements.length === 1) {
      setIsOpen(false)
    }
  }, [elements.length])

  const updateElement = useCallback((id: string, data: any) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, data: { ...el.data, ...data } } : el
    ))
  }, [])

  const clearElements = useCallback(() => {
    setElements([])
    setIsOpen(false)
  }, [])

  const handleElementAction = useCallback((elementId: string, action: string, data?: any) => {
    if (action === 'close') {
      removeElement(elementId)
    } else if (action === 'submit' && data) {
      // اینجا می‌تونی فرم رو پردازش کنی
      console.log('Form submitted:', data)
    }
  }, [removeElement])

  return {
    elements,
    isOpen,
    addElement,
    removeElement,
    updateElement,
    clearElements,
    handleElementAction
  }
}
