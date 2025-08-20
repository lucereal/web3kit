"use client"
import { useState } from "react"

export interface PageState {
  activeTab: "live" | "mock"
  loading: boolean
}

export function usePageState(initialTab: "live" | "mock" = "live") {
  const [state, setState] = useState<PageState>({
    activeTab: initialTab,
    loading: false,
  })

  const actions = {
    setActiveTab: (tab: "live" | "mock") => setState(s => ({ ...s, activeTab: tab })),
    setLoading: (loading: boolean) => setState(s => ({ ...s, loading })),
    reset: () => setState({
      activeTab: initialTab,
      loading: false,
    }),
  }

  return { state, actions }
}
