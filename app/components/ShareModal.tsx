'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { shareSystem } from '../lib/share'
import { useAuth } from '../hooks/useAuth'

type ShareModalProps = {
  sessionId: string
  onClose: () => void
}

export default function ShareModal({ sessionId, onClose }: ShareModalProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'link' | 'collab' | 'comments'>('link')
  const [shareLink, setShareLink] = useState<string>('')
  const [permission, setPermission] = useState<'view' | 'comment' | 'edit'>('view')
  const [expiresIn, setExpiresIn] = useState<number | null>(null)
  const [password, setPassword] = useState('')
  const [copied, setCopied] = useState(false)
  const [collaboratorEmail, setCollaboratorEmail] = useState('')
  const [collaborators, setCollaborators] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const createShareLink = async () => {
    if (!user) return
    setLoading(true)
    try {
      const link = await shareSystem.createShareLink(
        sessionId,
        user.id,
        permission,
        {
          expiresIn: expiresIn || undefined,
          password: password || undefined
        }
      )
      setShareLink(link.link)
    } catch (error) {
      console.error('Error creating share link:', error)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const addCollaborator = async () => {
    if (!collaboratorEmail) return
    setLoading(true)
    try {
      await shareSystem.addCollaborator(sessionId, collaboratorEmail, 'view')
      setCollaboratorEmail('')
      loadCollaborators()
    } catch (error) {
      console.error('Error adding collaborator:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCollaborators = async () => {
    const collabs = await shareSystem.getCollaborators(sessionId)
    setCollaborators(collabs)
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={styles.overlay}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        {/* هدر */}
        <div style={styles.header}>
          <h3 style={styles.title}>
            <span style={styles.icon}>🔗</span>
            اشتراک‌گذاری
          </h3>
          <button onClick={onClose} style={styles.closeButton}>×</button>
        </div>

        {/* تب‌ها */}
        <div style={styles.tabs}>
          <button
            onClick={() => setActiveTab('link')}
            style={{
              ...styles.tab,
              ...(activeTab === 'link' ? styles.activeTab : {})
            }}
          >
            🔗 لینک
          </button>
          <button
            onClick={() => setActiveTab('collab')}
            style={{
              ...styles.tab,
              ...(activeTab === 'collab' ? styles.activeTab : {})
            }}
          >
            👥 همکاران
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            style={{
              ...styles.tab,
              ...(activeTab === 'comments' ? styles.activeTab : {})
            }}
          >
            💬 نظرات
          </button>
        </div>

        {/* محتوا */}
        <div style={styles.content}>
          <AnimatePresence mode="wait">
            {activeTab === 'link' && (
              <motion.div
                key="link"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {!shareLink ? (
                  <>
                    <div style={styles.formGroup}>
                      <label style={styles.label}>دسترسی</label>
                      <select
                        value={permission}
                        onChange={(e) => setPermission(e.target.value as any)}
                        style={styles.select}
                      >
                        <option value="view">فقط مشاهده</option>
                        <option value="comment">مشاهده + نظر</option>
                        <option value="edit">ویرایش</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>انقضا (ساعت)</label>
                      <select
                        value={expiresIn || ''}
                        onChange={(e) => setExpiresIn(e.target.value ? Number(e.target.value) : null)}
                        style={styles.select}
                      >
                        <option value="">بدون انقضا</option>
                        <option value="1">۱ ساعت</option>
                        <option value="24">۲۴ ساعت</option>
                        <option value="168">۱ هفته</option>
                        <option value="720">۱ ماه</option>
                      </select>
                    </div>

                    <div style={styles.formGroup}>
                      <label style={styles.label}>رمز عبور (اختیاری)</label>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={styles.input}
                        placeholder="رمز عبور برای لینک"
                      />
                    </div>

                    <button
                      onClick={createShareLink}
                      disabled={loading}
                      style={styles.createButton}
                    >
                      {loading ? 'در حال ایجاد...' : 'ایجاد لینک'}
                    </button>
                  </>
                ) : (
                  <div style={styles.linkContainer}>
                    <p style={styles.linkLabel}>لینک اشتراک:</p>
                    <div style={styles.linkBox}>
                      <span style={styles.linkText}>{shareLink}</span>
                      <button
                        onClick={copyToClipboard}
                        style={styles.copyButton}
                      >
                        {copied ? '✅' : '📋'}
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'collab' && (
              <motion.div
                key="collab"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div style={styles.formGroup}>
                  <label style={styles.label}>ایمیل همکار</label>
                  <div style={styles.addCollaborator}>
                    <input
                      type="email"
                      value={collaboratorEmail}
                      onChange={(e) => setCollaboratorEmail(e.target.value)}
                      style={styles.input}
                      placeholder="example@email.com"
                    />
                    <button
                      onClick={addCollaborator}
                      disabled={loading}
                      style={styles.addButton}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div style={styles.collaboratorsList}>
                  {collaborators.map((collab) => (
                    <div key={collab.userId} style={styles.collaboratorItem}>
                      <span style={styles.collaboratorName}>{collab.name}</span>
                      <span style={styles.collaboratorPermission}>
                        {collab.permission === 'view' ? '👁️' :
                         collab.permission === 'comment' ? '💬' : '✏️'}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'comments' && (
              <motion.div
                key="comments"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <p style={styles.comingSoon}>به زودی...</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </motion.div>
  )
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.7)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    width: '90%',
    maxWidth: '500px',
    background: 'rgba(20,25,40,0.95)',
    backdropFilter: 'blur(20px)',
    borderRadius: '20px',
    border: '1px solid rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },
  header: {
    padding: '1.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  icon: {
    fontSize: '1.5rem',
  },
  closeButton: {
    background: 'transparent',
    border: 'none',
    color: '#fff',
    fontSize: '2rem',
    cursor: 'pointer',
    opacity: 0.7,
  },
  tabs: {
    display: 'flex',
    padding: '0.5rem',
    gap: '0.5rem',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
  },
  tab: {
    flex: 1,
    padding: '0.5rem',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  activeTab: {
    background: 'rgba(0,102,255,0.2)',
    opacity: 1,
  },
  content: {
    padding: '1.5rem',
    minHeight: '200px',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.9rem',
    opacity: 0.7,
    marginBottom: '0.3rem',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  input: {
    flex: 1,
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  createButton: {
    width: '100%',
    padding: '0.75rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    marginTop: '1rem',
  },
  linkContainer: {
    textAlign: 'center' as const,
  },
  linkLabel: {
    fontSize: '0.9rem',
    opacity: 0.7,
    marginBottom: '0.5rem',
  },
  linkBox: {
    display: 'flex',
    gap: '0.5rem',
    padding: '0.5rem',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '8px',
  },
  linkText: {
    flex: 1,
    fontSize: '0.9rem',
    wordBreak: 'break-all' as const,
  },
  copyButton: {
    padding: '0.3rem 0.8rem',
    background: 'rgba(255,255,255,0.1)',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
  },
  addCollaborator: {
    display: 'flex',
    gap: '0.5rem',
  },
  addButton: {
    padding: '0.5rem 1rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '8px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1.2rem',
  },
  collaboratorsList: {
    marginTop: '1rem',
  },
  collaboratorItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '8px',
    marginBottom: '0.3rem',
  },
  collaboratorName: {
    fontSize: '0.9rem',
  },
  collaboratorPermission: {
    fontSize: '1rem',
  },
  comingSoon: {
    textAlign: 'center' as const,
    opacity: 0.5,
    padding: '2rem',
  },
}
