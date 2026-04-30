"use client"

import React, { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  TrendingUp, TrendingDown, Target, Award, Clock, Users,
  Phone, MessageSquare, Star, AlertCircle, CheckCircle, BarChart3,
  LineChart, PieChart, Zap, Shield, Brain, Heart, ArrowUpRight,
  ArrowDownRight, Minus, Download, RefreshCw, Settings, Filter
} from "lucide-react"
import gsap from "gsap"
import { useGSAP } from "@gsap/react"

interface SPO {
  id: string
  name: string
  description: string
  target: number
  current: number
  unit: string
  trend: "up" | "down" | "stable"
  category: "customer" | "efficiency" | "quality" | "business"
}

interface KPI {
  id: string
  name: string
  value: number
  previousValue: number
  unit: string
  change: number
  trend: "up" | "down" | "stable"
  category: "volume" | "performance" | "quality" | "engagement"
}

interface AgentMetricsProps {
  agentId?: string
  timeRange?: "7d" | "30d" | "90d" | "1y"
  readOnly?: boolean
}

export default function AgentMetrics({
  agentId,
  timeRange = "30d",
  readOnly = false
}: AgentMetricsProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)
  const [spos, setSpos] = useState<SPO[]>([])
  const [kpis, setKpis] = useState<KPI[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    loadMetrics()
  }, [agentId, selectedTimeRange])

  const loadMetrics = async () => {
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setSpos([
        {
          id: "customer_satisfaction",
          name: "Customer Satisfaction",
          description: "Average customer rating from interactions",
          target: 4.5,
          current: 4.3,
          unit: "/5",
          trend: "up",
          category: "customer"
        },
        {
          id: "lead_conversion",
          name: "Lead Conversion Rate",
          description: "Percentage of leads converted to customers",
          target: 25,
          current: 22,
          unit: "%",
          trend: "up",
          category: "business"
        },
        {
          id: "call_efficiency",
          name: "Call Handling Efficiency",
          description: "Average time to resolve customer queries",
          target: 180,
          current: 165,
          unit: "sec",
          trend: "up",
          category: "efficiency"
        },
        {
          id: "knowledge_accuracy",
          name: "Knowledge Accuracy",
          description: "Accuracy of information provided to customers",
          target: 95,
          current: 92,
          unit: "%",
          trend: "stable",
          category: "quality"
        },
        {
          id: "response_time",
          name: "Average Response Time",
          description: "Time to respond to customer inquiries",
          target: 30,
          current: 28,
          unit: "sec",
          trend: "down",
          category: "efficiency"
        }
      ])

      setKpis([
        {
          id: "total_calls",
          name: "Total Calls Handled",
          value: 1247,
          previousValue: 1089,
          unit: "calls",
          change: 14.5,
          trend: "up",
          category: "volume"
        },
        {
          id: "avg_duration",
          name: "Average Call Duration",
          value: 245,
          previousValue: 267,
          unit: "sec",
          change: -8.2,
          trend: "down",
          category: "performance"
        },
        {
          id: "success_rate",
          name: "Success Rate",
          value: 87,
          previousValue: 84,
          unit: "%",
          change: 3.6,
          trend: "up",
          category: "performance"
        },
        {
          id: "escalation_rate",
          name: "Escalation Rate",
          value: 8,
          previousValue: 12,
          unit: "%",
          change: -33.3,
          trend: "down",
          category: "quality"
        },
        {
          id: "customer_feedback",
          name: "Customer Feedback Score",
          value: 4.3,
          previousValue: 4.1,
          unit: "/5",
          change: 4.9,
          trend: "up",
          category: "engagement"
        },
        {
          id: "first_call_resolution",
          name: "First Call Resolution",
          value: 78,
          previousValue: 72,
          unit: "%",
          change: 8.3,
          trend: "up",
          category: "quality"
        }
      ])

      setIsLoading(false)
    }, 1000)
  }

  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <ArrowUpRight className="w-4 h-4 text-green-400" />
      case "down":
        return <ArrowDownRight className="w-4 h-4 text-red-400" />
      case "stable":
        return <Minus className="w-4 h-4 text-gray-400" />
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "customer":
        return <Users className="w-5 h-5" />
      case "efficiency":
        return <Clock className="w-5 h-5" />
      case "quality":
        return <Star className="w-5 h-5" />
      case "business":
        return <TrendingUp className="w-5 h-5" />
      case "volume":
        return <BarChart3 className="w-5 h-5" />
      case "performance":
        return <LineChart className="w-5 h-5" />
      case "engagement":
        return <Heart className="w-5 h-5" />
      default:
        return <Target className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "customer":
        return "from-blue-500 to-cyan-600"
      case "efficiency":
        return "from-green-500 to-emerald-600"
      case "quality":
        return "from-purple-500 to-pink-600"
      case "business":
        return "from-orange-500 to-red-600"
      case "volume":
        return "from-indigo-500 to-purple-600"
      case "performance":
        return "from-teal-500 to-cyan-600"
      case "engagement":
        return "from-pink-500 to-rose-600"
      default:
        return "from-gray-500 to-slate-600"
    }
  }

  const overallSPOScore = Math.round(
    spos.reduce((acc, spo) => {
      const progress = (spo.current / spo.target) * 100
      return acc + Math.min(progress, 100)
    }, 0) / spos.length
  )

  const overallKPIScore = Math.round(
    kpis.reduce((acc, kpi) => {
      return acc + (kpi.trend === "up" ? 100 : kpi.trend === "down" ? 50 : 75)
    }, 0) / kpis.length
  )

  return (
    <div className="h-full flex flex-col bg-[#0c0c10]">
      {/* Header */}
      <div className="bg-[#1a1a20] border-b border-[#FEED01]/20 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FEED01]" />
              Agent Performance Metrics
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Strategic Performance Objectives & Key Performance Indicators
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Range Selector */}
            <div className="flex items-center gap-1 bg-[#0c0c10] rounded-lg p-1">
              {["7d", "30d", "90d", "1y"].map((range) => (
                <button
                  key={range}
                  onClick={() => setSelectedTimeRange(range as any)}
                  className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                    selectedTimeRange === range
                      ? "bg-[#FEED01] text-black"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            <button
              onClick={() => loadMetrics()}
              className="p-2 bg-[#0c0c10] border border-[#FEED01]/20 rounded-lg hover:border-[#FEED01] transition-colors"
            >
              <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? "animate-spin" : ""}`} />
            </button>

            {!readOnly && (
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 bg-[#0c0c10] border border-[#FEED01]/20 rounded-lg hover:border-[#FEED01] transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-12 h-12 border-2 border-[#FEED01] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-400">Loading metrics...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overall Score Cards */}
            <div className="grid grid-cols-2 gap-4">
              {/* SPO Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-[#1a1a20] to-[#0c0c10] border border-[#FEED01]/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-[#FEED01] to-[#FFD700] rounded-lg">
                      <Award className="w-6 h-6 text-black" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">SPO Score</p>
                      <p className="text-2xl font-bold text-white">{overallSPOScore}%</p>
                    </div>
                  </div>
                  {getTrendIcon(
                    overallSPOScore >= 80 ? "up" : overallSPOScore >= 60 ? "stable" : "down"
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Progress</span>
                    <span className="text-white">{overallSPOScore}%</span>
                  </div>
                  <div className="h-2 bg-[#0c0c10] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-[#FEED01] to-[#FFD700]"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallSPOScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>

              {/* KPI Score */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-[#1a1a20] to-[#0c0c10] border border-[#FEED01]/20 rounded-xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">KPI Score</p>
                      <p className="text-2xl font-bold text-white">{overallKPIScore}%</p>
                    </div>
                  </div>
                  {getTrendIcon(
                    overallKPIScore >= 80 ? "up" : overallKPIScore >= 60 ? "stable" : "down"
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Performance</span>
                    <span className="text-white">{overallKPIScore}%</span>
                  </div>
                  <div className="h-2 bg-[#0c0c10] rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-600"
                      initial={{ width: 0 }}
                      animate={{ width: `${overallKPIScore}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* SPOs Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Target className="w-5 h-5 text-[#FEED01]" />
                  Strategic Performance Objectives
                </h3>
                <span className="text-sm text-gray-400">{spos.length} objectives</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {spos.map((spo, index) => (
                  <motion.div
                    key={spo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gradient-to-r ${getCategoryColor(spo.category)} rounded-lg`}>
                          {getCategoryIcon(spo.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{spo.name}</h4>
                          <p className="text-xs text-gray-400 mt-1">{spo.description}</p>
                        </div>
                      </div>

                      {getTrendIcon(spo.trend)}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Current</span>
                        <span className="text-lg font-bold text-white">
                          {spo.current} {spo.unit}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Target</span>
                        <span className="text-sm text-gray-300">
                          {spo.target} {spo.unit}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">Progress</span>
                          <span className={`font-medium ${
                            (spo.current / spo.target) * 100 >= 100
                              ? "text-green-400"
                              : (spo.current / spo.target) * 100 >= 80
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}>
                            {Math.round((spo.current / spo.target) * 100)}%
                          </span>
                        </div>
                        <div className="h-2 bg-[#0c0c10] rounded-full overflow-hidden">
                          <motion.div
                            className={`h-full bg-gradient-to-r ${getCategoryColor(spo.category)}`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min((spo.current / spo.target) * 100, 100)}%`
                            }}
                            transition={{ duration: 1, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* KPIs Section */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-[#FEED01]" />
                  Key Performance Indicators
                </h3>
                <span className="text-sm text-gray-400">{kpis.length} metrics</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kpis.map((kpi, index) => (
                  <motion.div
                    key={kpi.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-[#1a1a20] border border-[#FEED01]/20 rounded-xl p-5"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 bg-gradient-to-r ${getCategoryColor(kpi.category)} rounded-lg`}>
                          {getCategoryIcon(kpi.category)}
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{kpi.name}</h4>
                          <p className="text-xs text-gray-400 mt-1 capitalize">{kpi.category}</p>
                        </div>
                      </div>

                      {getTrendIcon(kpi.trend)}
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-end justify-between">
                        <span className="text-3xl font-bold text-white">
                          {kpi.value}
                        </span>
                        <span className="text-sm text-gray-400 mb-1">{kpi.unit}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${
                          kpi.change > 0 ? "text-green-400" :
                          kpi.change < 0 ? "text-red-400" :
                          "text-gray-400"
                        }`}>
                          {kpi.change > 0 ? "+" : ""}{kpi.change}%
                        </span>
                        <span className="text-xs text-gray-400">vs previous</span>
                      </div>

                      <div className="pt-2 border-t border-[#FEED01]/10">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-400">Previous</span>
                          <span className="text-gray-300">
                            {kpi.previousValue} {kpi.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Insights Section */}
            <div className="bg-gradient-to-br from-[#1a1a20] to-[#0c0c10] border border-[#FEED01]/20 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gradient-to-r from-[#FEED01] to-[#FFD700] rounded-lg">
                  <Brain className="w-5 h-5 text-black" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">AI Insights</h3>
                  <p className="text-sm text-gray-400">Performance analysis and recommendations</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-[#0c0c10] rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">Strong Performance</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Customer satisfaction and lead conversion rates are exceeding targets. Continue current approach.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#0c0c10] rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">Optimization Opportunity</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Response time has increased slightly. Consider optimizing knowledge base for faster retrieval.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-[#0c0c10] rounded-lg">
                  <Zap className="w-5 h-5 text-[#FEED01] mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-white font-medium">Recommendation</p>
                    <p className="text-xs text-gray-400 mt-1">
                      First call resolution improved by 8.3%. Consider expanding successful patterns to other interaction types.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
