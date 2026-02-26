'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMemory } from '../hooks/useMemory'

export default function UserProfile() {
  const { profile, loading, updateProfile } = useMemory()
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<any>({})

  if (loading) {
    return (
      <div style={styles.loading}>
        <div style={styles.spinner} />
      </div>
    )
  }

  const handleSave = async () => {
    await updateProfile(editedProfile)
    setIsEditing(false)
  }

  return (
    <div style={styles.container}>
      {/* هدر */}
      <div style={styles.header}>
        <h3 style={styles.title}>
          <span style={styles.icon}>👤</span>
          پروفایل شخصی
        </h3>
        <button
          onClick={() => setIsEditing(!isEditing)}
          style={styles.editButton}
        >
          {isEditing ? '✕' : '✎'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="edit"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.editForm}
          >
            <div style={styles.formGroup}>
              <label style={styles.label}>نام</label>
              <input
                type="text"
                value={editedProfile.name || profile?.name || ''}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                style={styles.input}
                placeholder="نام شما"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>سبک گفتگو</label>
              <select
                value={editedProfile.tone || profile?.tone || 'friendly'}
                onChange={(e) => setEditedProfile({ ...editedProfile, tone: e.target.value })}
                style={styles.select}
              >
                <option value="formal">رسمی</option>
                <option value="friendly">دوستانه</option>
                <option value="professional">حرفه‌ای</option>
                <option value="funny">شوخ</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>زبان</label>
              <select
                value={editedProfile.language || profile?.language || 'fa'}
                onChange={(e) => setEditedProfile({ ...editedProfile, language: e.target.value })}
                style={styles.select}
              >
                <option value="fa">فارسی</option>
                <option value="en">English</option>
              </select>
            </div>

            <div style={styles.buttonGroup}>
              <button onClick={handleSave} style={styles.saveButton}>
                ذخیره
              </button>
              <button onClick={() => setIsEditing(false)} style={styles.cancelButton}>
                انصراف
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="view"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={styles.profileInfo}
          >
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>نام:</span>
              <span style={styles.infoValue}>{profile?.name || 'ثبت نشده'}</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>سبک گفتگو:</span>
              <span style={styles.infoValue}>
                {profile?.tone === 'formal' ? 'رسمی' :
                 profile?.tone === 'friendly' ? 'دوستانه' :
                 profile?.tone === 'professional' ? 'حرفه‌ای' :
                 profile?.tone === 'funny' ? 'شوخ' : 'پیش‌فرض'}
              </span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>زبان:</span>
              <span style={styles.infoValue}>
                {profile?.language === 'fa' ? 'فارسی' : 'English'}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* آمار حافظه */}
      <div style={styles.stats}>
        <div style={styles.stat}>
          <span style={styles.statValue}>{profile?.topics?.length || 0}</span>
          <span style={styles.statLabel}>موضوعات</span>
        </div>
        <div style={styles.stat}>
          <span style={styles.statValue}>-</span>
          <span style={styles.statLabel}>تعاملات</span>
        </div>
      </div>
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
  editButton: {
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '20px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '1rem',
    padding: '0.2rem 0.8rem',
  },
  profileInfo: {
    padding: '1rem',
  },
  infoRow: {
    display: 'flex',
    marginBottom: '0.5rem',
  },
  infoLabel: {
    width: '100px',
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  infoValue: {
    flex: 1,
    fontSize: '0.9rem',
    color: '#aaddff',
  },
  editForm: {
    padding: '1rem',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    opacity: 0.7,
    marginBottom: '0.3rem',
  },
  input: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  select: {
    width: '100%',
    padding: '0.5rem',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.9rem',
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.5rem',
    marginTop: '1rem',
  },
  saveButton: {
    flex: 1,
    padding: '0.5rem',
    background: '#0066ff',
    border: 'none',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  cancelButton: {
    flex: 1,
    padding: '0.5rem',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '6px',
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  stats: {
    display: 'flex',
    borderTop: '1px solid rgba(255,255,255,0.1)',
    padding: '0.5rem',
  },
  stat: {
    flex: 1,
    textAlign: 'center' as const,
  },
  statValue: {
    display: 'block',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    color: '#0066ff',
  },
  statLabel: {
    fontSize: '0.7rem',
    opacity: 0.6,
  },
  loading: {
    padding: '2rem',
    display: 'flex',
    justifyContent: 'center',
  },
  spinner: {
    width: '30px',
    height: '30px',
    border: '2px solid rgba(255,255,255,0.1)',
    borderTop: '2px solid #0066ff',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
}
