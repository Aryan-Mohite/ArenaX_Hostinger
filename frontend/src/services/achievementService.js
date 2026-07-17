import API from '../api/api'

// GET { achieved: [...], locked: [...], streak: { current_streak, longest_streak } }
export const getMyAchievements = () => API.get('/achievements/me')
