'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'

type VisualElement = {
  id: string
  type: 'chart' | 'table' | 'timeline' | 'gallery' | 'code' | 'form' | 'map' | 'calculator'
  data: any
  layout?: 'grid' | 'list' | 'card' | 'full'
}

type VisualLayoutProps = {
  elements: VisualElement[]
  onElementAction?: (elementId: string, action: string, data?: any) => void
}

export default function VisualLayout({ elements, onElementAction }: VisualLayoutProps) {
  const [activeElement, setActiveElement] = useState<string | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)

  const renderElement = (element: VisualElement) => {
    switch (element.type) {
      case 'chart':
        return <ChartElement data={element.data} expanded={expanded === element.id} />
      case 'table':
        return <TableElement data={element.data} expanded={expanded === element.id} />
      case 'timeline':
        return <TimelineElement data={element.data} />
      case 'gallery':
        return <GalleryElement data={element.data} />
      case 'code':
        return <CodeElement data={element.data} />
      case 'form':
        return <FormElement data={element.data} onSubmit={(data) => onElementAction?.(element.id, 'submit', data)} />
      case 'map':
        return <MapElement data={element.data} />
      case 'calculator':
        return <CalculatorElement />
      default:
        return null
    }
  }

  return (
    <div style={styles.container}>
      <AnimatePresence>
        {elements.map((element, idx) => (
          <motion.div
            key={element.id}
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ delay: idx * 0.1 }}
            style={{
              ...styles.element,
              ...(expanded === element.id ? styles.expanded : {}),
              ...(activeElement === element.id ? styles.active : {})
            }}
            onMouseEnter={() => setActiveElement(element.id)}
            onMouseLeave={() => setActiveElement(null)}
          >
            {/* هدر المان */}
            <div style={styles.elementHeader}>
              <span style={styles.elementIcon}>{getIcon(element.type)}</span>
              <span style={styles.elementTitle}>{element.data.title || element.type}</span>
              <div style={styles.elementActions}>
                {element.layout !== 'full' && (
                  <button
                    onClick={() => setExpanded(expanded === element.id ? null : element.id)}
                    style={styles.actionButton}
                  >
                    {expanded === element.id ? '🔽' : '🔼'}
                  </button>
                )}
                {onElementAction && (
                  <button
                    onClick={() => onElementAction(element.id, 'close')}
                    style={styles.actionButton}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* محتوای المان */}
            <div style={styles.elementContent}>
              {renderElement(element)}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

// ========== المان‌های تخصصی ==========

function ChartElement({ data, expanded }: { data: any; expanded: boolean }) {
  return (
    <div style={styles.chartContainer}>
      {data.type === 'bar' && (
        <div style={styles.barChart}>
          {data.labels.map((label: string, i: number) => (
            <div key={i} style={styles.barItem}>
              <span style={styles.barLabel}>{label}</span>
              <div style={styles.barTrack}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(data.values[i] / Math.max(...data.values)) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                  style={{
                    ...styles.barFill,
                    background: `hsl(${i * 30}, 70%, 50%)`
                  }}
                />
              </div>
              <span style={styles.barValue}>{data.values[i]}</span>
            </div>
          ))}
        </div>
      )}
      {data.type === 'pie' && (
        <div style={styles.pieContainer}>
          <div style={styles.pie}>
            {data.values.map((value: number, i: number) => {
              const percentage = (value / data.total) * 100
              return (
                <motion.div
                  key={i}
                  initial={{ rotate: 0 }}
                  animate={{ rotate: percentage * 3.6 }}
                  transition={{ duration: 1 }}
                  style={{
                    ...styles.pieSlice,
                    background: `hsl(${i * 30}, 70%, 50%)`,
                    transform: `rotate(${percentage * 3.6}deg)`
                  }}
                />
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function TableElement({ data, expanded }: { data: any; expanded: boolean }) {
  return (
    <div style={{ ...styles.tableWrapper, maxHeight: expanded ? 'none' : '300px' }}>
      <table style={styles.table}>
        <thead>
          <tr>
            {data.headers.map((header: string, i: number) => (
              <th key={i} style={styles.th}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.rows.map((row: any[], i: number) => (
            <tr key={i}>
              {row.map((cell, j) => (
                <td key={j} style={styles.td}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TimelineElement({ data }: { data: any }) {
  return (
    <div style={styles.timeline}>
      {data.events.map((event: any, i: number) => (
        <motion.div
          key={i}
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: i * 0.2 }}
          style={styles.timelineEvent}
        >
          <div style={styles.timelineDot} />
          <div style={styles.timelineContent}>
            <span style={styles.timelineDate}>{event.date}</span>
            <span style={styles.timelineTitle}>{event.title}</span>
            <p style={styles.timelineDescription}>{event.description}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function GalleryElement({ data }: { data: any }) {
  return (
    <div style={styles.gallery}>
      {data.images.map((img: string, i: number) => (
        <motion.img
          key={i}
          src={img}
          alt={`Gallery ${i}`}
          initial={{ scale: 0, rotate: -10 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: i * 0.1 }}
          whileHover={{ scale: 1.1 }}
          style={styles.galleryImage}
        />
      ))}
    </div>
  )
}

function CodeElement({ data }: { data: any }) {
  const [copied, setCopied] = useState(false)

  const copyCode = () => {
    navigator.clipboard.writeText(data.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div style={styles.codeContainer}>
      <div style={styles.codeHeader}>
        <span style={styles.codeLanguage}>{data.language}</span>
        <button onClick={copyCode} style={styles.copyButton}>
          {copied ? '✅' : '📋'}
        </button>
      </div>
      <pre style={styles.codeBlock}>
        <code>{data.code}</code>
      </pre>
    </div>
  )
}

function FormElement({ data, onSubmit }: { data: any; onSubmit: (data: any) => void }) {
  const [formData, setFormData] = useState<any>({})

  return (
    <div style={styles.form}>
      {data.fields.map((field: any, i: number) => (
        <div key={i} style={styles.formField}>
          <label style={styles.formLabel}>{field.label}</label>
          {field.type === 'text' && (
            <input
              type="text"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={styles.formInput}
              placeholder={field.placeholder}
            />
          )}
          {field.type === 'number' && (
            <input
              type="number"
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={styles.formInput}
            />
          )}
          {field.type === 'select' && (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              style={styles.formSelect}
            >
              {field.options.map((opt: string, j: number) => (
                <option key={j} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}
      <button
        onClick={() => onSubmit(formData)}
        style={styles.formSubmit}
      >
        {data.submitText || 'ارسال'}
      </button>
    </div>
  )
}

function MapElement({ data }: { data: any }) {
  return (
    <div style={styles.mapContainer}>
      <iframe
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${data.bbox}&layer=mapnik`}
        style={styles.map}
        title="map"
      />
    </div>
  )
}

function CalculatorElement() {
  const [display, setDisplay] = useState('0')
  const [operator, setOperator] = useState('')
  const [prevValue, setPrevValue] = useState<number | null>(null)

  const handleNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num)
  }

  const handleOperator = (op: string) => {
    setOperator(op)
    setPrevValue(parseFloat(display))
    setDisplay('0')
  }

  const handleEqual = () => {
    if (prevValue === null) return
    const current = parseFloat(display)
    let result = 0
    switch (operator) {
      case '+': result = prevValue + current; break
      case '-': result = prevValue - current; break
      case '×': result = prevValue * current; break
      case '÷': result = prevValue / current; break
    }
    setDisplay(result.toString())
    setPrevValue(null)
    setOperator('')
  }

  const handleClear = () => {
    setDisplay('0')
    setPrevValue(null)
    setOperator('')
  }

  return (
    <div style={styles.calculator}>
      <div style={styles.calcDisplay}>{display}</div>
      <div style={styles.calcButtons}>
        {['7', '8', '9', '÷'].map((btn) => (
          <button
            key={btn}
            onClick={() => btn.match(/[0-9]/) ? handleNumber(btn) : handleOperator('÷')}
            style={styles.calcButton}
          >
            {btn}
          </button>
        ))}
        {['4', '5', '6', '×'].map((btn) => (
          <button
            key={btn}
            onClick={() => btn.match(/[0-9]/) ? handleNumber(btn) : handleOperator('×')}
            style={styles.calcButton}
          >
            {btn}
          </button>
        ))}
        {['1', '2', '3', '-'].map((btn) => (
          <button
            key={btn}
            onClick={() => btn.match(/[0-9]/) ? handleNumber(btn) : handleOperator('-')}
            style={styles.calcButton}
          >
            {btn}
          </button>
        ))}
        {['0', '.', '=', '+'].map((btn) => (
          <button
            key={btn}
            onClick={() => {
              if (btn === '=') handleEqual()
              else if (btn === '+') handleOperator('+')
              else handleNumber(btn)
            }}
            style={styles.calcButton}
          >
            {btn}
          </button>
        ))}
        <button onClick={handleClear} style={{ ...styles.calcButton, ...styles.calcClear }}>
          C
        </button>
      </div>
    </div>
  )
}

// ========== Helper Functions ==========
function getIcon(type: string): string {
  const icons: Record<string, string> = {
    chart: '📊',
    table: '📋',
    timeline: '⏳',
    gallery: '🖼️',
    code: '💻',
    form: '📝',
    map: '🗺️',
    calculator: '🧮'
  }
  return icons[type] || '📦'
}

// ========== Styles ==========
const styles = {
  container: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '1rem',
    margin: '1rem 0',
  },
  element: {
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    transition: 'all 0.3s ease',
  },
  expanded: {
    gridColumn: '1 / -1',
  },
  active: {
    borderColor: '#0066ff',
    boxShadow: '0 0 20px rgba(0,102,255,0.3)',
  },
  elementHeader: {
    padding: '0.75rem',
    background: 'rgba(0,0,0,0.2)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  elementIcon: {
    fontSize: '1.2rem',
  },
  elementTitle: {
    flex: 1,
    fontSize: '0.9rem',
    fontWeight: 500,
    color: '#aaddff',
  },
  elementActions: {
    display: 'flex',
    gap: '0.3rem',
  },
  actionButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0.2rem 0.5rem',
  },
  elementContent: {
    padding: '1rem',
  },
  chartContainer: {
    minHeight: '200px',
  },
  barChart: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  barItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  barLabel: {
    width: '80px',
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  barTrack: {
    flex: 1,
    height: '20px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
    borderRadius: '10px',
  },
  barValue: {
    width: '40px',
    fontSize: '0.8rem',
    textAlign: 'right' as const,
  },
  pieContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '200px',
  },
  pie: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    position: 'relative' as const,
    overflow: 'hidden',
  },
  pieSlice: {
    position: 'absolute' as const,
    width: '100%',
    height: '100%',
    transformOrigin: '50% 50%',
  },
  tableWrapper: {
    overflowY: 'auto' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '0.9rem',
  },
  th: {
    background: 'rgba(0,102,255,0.2)',
    padding: '0.5rem',
    textAlign: 'left' as const,
    fontWeight: 600,
  },
  td: {
    padding: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  timeline: {
    position: 'relative' as const,
    paddingLeft: '20px',
  },
  timelineEvent: {
    position: 'relative' as const,
    paddingBottom: '1rem',
    display: 'flex',
    gap: '1rem',
  },
  timelineDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#0066ff',
    marginTop: '5px',
  },
  timelineContent: {
    flex: 1,
  },
  timelineDate: {
    fontSize: '0.7rem',
    opacity: 0.7,
    display: 'block',
  },
  timelineTitle: {
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'block',
  },
  timelineDescription: {
    fontSize: '0.8rem',
    opacity: 0.8,
    margin: '0.2rem 0 0',
  },
  gallery: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
    gap: '0.5rem',
  },
  galleryImage: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover' as const,
    borderRadius: '8px',
    cursor: 'pointer',
  },
  codeContainer: {
    background: '#1e1e1e',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  codeHeader: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  codeLanguage: {
    fontSize: '0.8rem',
    color: '#aaddff',
  },
  copyButton: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '4px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0.2rem 0.5rem',
  },
  codeBlock: {
    padding: '1rem',
    margin: 0,
    overflowX: 'auto' as const,
    fontSize: '0.8rem',
    lineHeight: 1.5,
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem',
  },
  formField: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.3rem',
  },
  formLabel: {
    fontSize: '0.8rem',
    color: '#aaddff',
  },
  formInput: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  formSelect: {
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  formSubmit: {
    padding: '0.5rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
  },
  mapContainer: {
    height: '200px',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
    border: 'none',
  },
  calculator: {
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '8px',
    padding: '0.5rem',
  },
  calcDisplay: {
    background: 'rgba(255,255,255,0.1)',
    padding: '1rem',
    borderRadius: '6px',
    textAlign: 'right' as const,
    fontSize: '1.2rem',
    marginBottom: '0.5rem',
  },
  calcButtons: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '0.3rem',
  },
  calcButton: {
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.8rem',
    '&:hover': {
      background: '#0066ff',
    },
  },
  calcClear: {
    gridColumn: 'span 4',
    background: '#ff4444',
  },
}
