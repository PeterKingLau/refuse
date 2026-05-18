import { defineStore } from 'pinia'
import { store } from '../index'

interface AxiosState {
  token: string
}

export const useAxiosStore = defineStore('axios', {
  state: (): AxiosState => {
    return {
      token: ''
    }
  },

  getters: {
    getToken(): string | null {
      return window.localStorage.getItem('Token')
    }
  },
  actions: {
    setToken(_token: string) {
      window.localStorage.setItem('Token', _token)
    }
  }
})

export const useAxiosStoreWithOut = () => {
  return useAxiosStore(store)
}
