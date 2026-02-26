'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { pluginSystem } from '../lib/plugin-system'
import { Plugin } from '../types/plugin'

export default function PluginManager() {
  const [plugins, setPlugins] = useState<Plugin[]>([])
  const [enabledPlugins, setEnabledPlugins] = useState<Set<string>>(new Set())
  const [showStore, setShowStore] = useState(false)

  useEffect(() => {
    // بارگذاری پلاگین‌ها
    const allPlugins = pluginSystem.getAllPlugins()
    setPlugins(allPlugins)
    setEnabledPlugins(pluginSystem['store'].enabledPlugins)
  }, [])

  const togglePlugin = async (pluginId: string, enabled: boolean) => {
    if (enabled) {
      await pluginSystem.enablePlugin(pluginId)
      setEnabledPlugins(prev => new Set([...prev, pluginId]))
    } else {
      await pluginSystem.disablePlugin(pluginId)
      setEnabledPlugins(prev => {
        const newSet = new Set(prev)
        newSet.delete(pluginId)
        return newSet
      })
    }
  }

  return (
    <div style={styles.container}>
      {/* هدر */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span style={styles.icon}>🔌</span>
          Plugin Manager
        </h3>
        <button
          onClick={() => setShowStore(!showStore)}
          style={styles.storeButton}
        >
          {showStore ? '📋 لیست پلاگین‌ها' : '🛍️ فروشگاه'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showStore ? (
          <motion.div
            key="store"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            style={styles.store}
          >
            <h4 style={styles.sectionTitle}>فروشگاه پلاگین‌ها</h4>
            <p style={styles.comingSoon}>به زودی...</p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            style={styles.pluginList}
          >
            {plugins.map(plugin => (
              <motion.div
                key={plugin.manifest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                style={styles.pluginCard}
              >
                <div style={styles.pluginInfo}>
                  <span style={styles.pluginIcon}>{plugin.manifest.icon || '📦'}</span>
                  <div style={styles.pluginDetails}>
                    <span style={styles.pluginName}>
                      {plugin.manifest.name}
                      <span style={styles.pluginVersion}>v{plugin.manifest.version}</span>
                    </span>
                    <span style={styles.pluginDescription}>{plugin.manifest.description}</span>
                    <span style={styles.pluginAuthor}>by {plugin.manifest.author}</span>
                  </div>
                </div>
                
                <label style={styles.switch}>
                  <input
                    type="checkbox"
                    checked={enabledPlugins.has(plugin.manifest.id)}
                    onChange={(e) => togglePlugin(plugin.manifest.id, e.target.checked)}
                  />
                  <span style={styles.slider} />
                </label>
              </motion.div>
            ))}

            {plugins.length === 0 && (
              <div style={styles.empty}>
                <p>هیچ پلاگینی نصب نیست</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

const styles = {
  container: {
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
    margin: '1rem 0',
  },
  header: {
    padding: '1rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    fontSize: '1.2rem',
  },
  storeButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.8rem',
    padding: '0.3rem 1rem',
  },
  sectionTitle: {
    margin: '0 0 1rem',
    fontSize: '0.9rem',
    color: '#aaddff',
  },
  pluginList: {
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem',
  },
  pluginCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  pluginInfo: {
    display: 'flex',
    gap: '0.75rem',
    alignItems: 'center',
  },
  pluginIcon: {
    fontSize: '1.5rem',
  },
  pluginDetails: {
    display: 'flex',
    flexDirection: 'column' as const,
  },
  pluginName: {
    fontSize: '0.9rem',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  pluginVersion: {
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  pluginDescription: {
    fontSize: '0.8rem',
    opacity: 0.8,
  },
  pluginAuthor: {
    fontSize: '0.7rem',
    opacity: 0.5,
  },
  switch: {
    position: 'relative' as const,
    display: 'inline-block',
    width: '44px',
    height: '24px',
  },
  slider: {
    position: 'absolute' as const,
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: '24px',
    transition: '0.2s',
    '&:before': {
      position: 'absolute' as const,
      content: '""',
      height: '20px',
      width: '20px',
      left: '2px',
      bottom: '2px',
      backgroundColor: '#fff',
      borderRadius: '50%',
      transition: '0.2s',
    },
    'input:checked + &': {
      backgroundColor: '#0066ff',
    },
    'input:checked + &:before': {
      transform: 'translateX(20px)',
    },
  },
  store: {
    padding: '2rem',
    textAlign: 'center' as const,
  },
  comingSoon: {
    fontSize: '0.9rem',
    opacity: 0.5,
  },
  empty: {
    padding: '2rem',
    textAlign: 'center' as const,
    opacity: 0.5,
  },
}
