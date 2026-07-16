import API from '../api/api'

// ─── Gamer DNA profile ────────────────────────────────────────────────────────
export const getMyDna      = ()     => API.get('/gamer-dna/me')
export const saveMyDna     = (data) => API.post('/gamer-dna', data)

// ─── Swipe candidates & actions ───────────────────────────────────────────────
export const getCandidates = (params) => API.get('/gamer-dna/candidates', { params })
export const swipeUser     = (target_id, action) => API.post('/gamer-dna/swipe', { target_id, action })

// ─── Matches ──────────────────────────────────────────────────────────────────
export const getMyMatches  = () => API.get('/gamer-dna/matches')
