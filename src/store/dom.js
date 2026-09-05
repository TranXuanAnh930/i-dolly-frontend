/**
 * anything that relates to DOM
 */
import { defineStore } from 'pinia'

export const useDomStore = defineStore('dom', {
  state: () => ({
    windowWidth: 0,
    /**
     * breakpoint constants
     */
    widthExtraSmall: 320,
    widthSmall: 640,
    widthTablet: 1024
  }),

  getters: {
    isExtraSmall: (state) => state.windowWidth <= state.widthExtraSmall,
    isSmall: (state) => state.windowWidth <= state.widthSmall,
    isTablet: (state) => state.windowWidth <= state.widthTablet,
    isDesktop: (state) => state.windowWidth > state.widthTablet
  },

  actions: {
    setWindowWidth (value) {
      this.windowWidth = value
    }
  }
})
