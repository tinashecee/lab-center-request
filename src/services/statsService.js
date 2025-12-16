import {
  collection,
  query,
  where,
  getDocs,
  Timestamp
} from 'firebase/firestore'
import { db } from './firebase'

const collectionRequestsRef = collection(db, 'collectionRequests')

export const statsService = {
  async getStats(centerId, centerName, timeFilter = 'all') {
    try {
      // Get date range based on filter
      const { start, end } = this.getDateRange(timeFilter)
      
      // Build base query - filter by center and sample_type
      let baseQuery
      
      if (centerId) {
        baseQuery = query(
          collectionRequestsRef,
          where('center_id', '==', centerId),
          where('sample_type', '==', 'center_requested')
        )
      } else if (centerName) {
        baseQuery = query(
          collectionRequestsRef,
          where('center_name', '==', centerName),
          where('sample_type', '==', 'center_requested')
        )
      } else {
        // If no center filter, still filter by sample_type
        baseQuery = query(
          collectionRequestsRef,
          where('sample_type', '==', 'center_requested')
        )
      }
      
      // Apply time filter if not 'all'
      if (timeFilter !== 'all' && start && end) {
        const startTs = Timestamp.fromDate(start)
        const endTs = Timestamp.fromDate(end)
        
        if (centerId) {
          baseQuery = query(
            collectionRequestsRef,
            where('center_id', '==', centerId),
            where('sample_type', '==', 'center_requested'),
            where('created_at', '>=', startTs),
            where('created_at', '<=', endTs)
          )
        } else if (centerName) {
          baseQuery = query(
            collectionRequestsRef,
            where('center_name', '==', centerName),
            where('sample_type', '==', 'center_requested'),
            where('created_at', '>=', startTs),
            where('created_at', '<=', endTs)
          )
        } else {
          baseQuery = query(
            collectionRequestsRef,
            where('sample_type', '==', 'center_requested'),
            where('created_at', '>=', startTs),
            where('created_at', '<=', endTs)
          )
        }
      }
      
      // Get all requests
      const allSnapshot = await getDocs(baseQuery)
      const allRequests = allSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      // Calculate stats
      const stats = {
        totalSamples: allRequests.length,
        pendingCollections: allRequests.filter(r => r.status === 'pending').length,
        inProgress: allRequests.filter(r => 
          ['collected', 'registered', 'received', 'processing'].includes(r.status)
        ).length,
        completed: allRequests.filter(r => r.status === 'completed').length,
        delivered: allRequests.filter(r => r.status === 'delivered').length
      }
      
      return stats
    } catch (error) {
      if (error.message && error.message.includes('requires an index')) {
        console.error('Index required. Please create the following index in Firebase Console:')
        if (centerId) {
          console.error('Collection: collectionRequests')
          console.error('Fields to index: center_id Ascending, sample_type Ascending, created_at Ascending')
        } else if (centerName) {
          console.error('Collection: collectionRequests')
          console.error('Fields to index: center_name Ascending, sample_type Ascending, created_at Ascending')
        }
      }
      console.error('Error fetching stats:', error)
      throw error
    }
  },
  
  getDateRange(timeFilter) {
    const now = new Date()
    let start = null
    let end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999)
    
    switch (timeFilter) {
      case 'day':
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0)
        break
      case 'week':
        const dayOfWeek = now.getDay()
        start = new Date(now)
        start.setDate(now.getDate() - dayOfWeek)
        start.setHours(0, 0, 0, 0)
        break
      case 'month':
        start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0)
        break
      case 'year':
        start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0)
        break
      default:
        start = null
        end = null
    }
    
    return { start, end }
  }
}

