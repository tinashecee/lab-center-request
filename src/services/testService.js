import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db } from './firebase'

const testsRef = collection(db, 'tests')

export const testService = {
  async getAllTests() {
    try {
      const q = query(testsRef, orderBy('testName', 'asc'))
      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Error fetching tests:', error)
      throw error
    }
  },
  
  async searchTests(searchTerm) {
    try {
      const allTests = await this.getAllTests()
      const lowerSearchTerm = searchTerm.toLowerCase()
      return allTests.filter(test => 
        test.testName?.toLowerCase().includes(lowerSearchTerm) ||
        test.testID?.toLowerCase().includes(lowerSearchTerm)
      )
    } catch (error) {
      console.error('Error searching tests:', error)
      throw error
    }
  }
}

