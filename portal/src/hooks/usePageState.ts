"use client"
import { useState } from "react"

export interface PageState {
  showTxDrawer: boolean
  activeTab: "live" | "mock"
  loading: boolean
}

export function usePageState(initialTab: "live" | "mock" = "live") {
  const [state, setState] = useState<PageState>({
    showTxDrawer: false,
    activeTab: initialTab,
    loading: false,
  })

  const actions = {
    openTxDrawer: () => setState(s => ({ ...s, showTxDrawer: true })),
    closeTxDrawer: () => setState(s => ({ ...s, showTxDrawer: false })),
    setActiveTab: (tab: "live" | "mock") => setState(s => ({ ...s, activeTab: tab })),
    setLoading: (loading: boolean) => setState(s => ({ ...s, loading })),
    reset: () => setState({
      showTxDrawer: false,
      activeTab: initialTab,
      loading: false,
    }),
  }

  return { state, actions }
}
