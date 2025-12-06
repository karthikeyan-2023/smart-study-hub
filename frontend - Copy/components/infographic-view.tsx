"use client"

import { useMemo, useState } from "react"
import {
  BookOpen,
  FileText,
  Brain,
  Clock,
  Target,
  Award,
  Zap,
  BarChart3,
  Flame,
  Calendar,
  Trophy,
  Lightbulb,
  CheckCircle2,
  Star,
  GraduationCap,
  Plus,
  Trash2,
  Sparkles,
  Download,
  Check,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { useAppStore } from "@/lib/store"
import { toast } from "sonner"
import type { Deadline } from "@/lib/types"

export function InfographicView() {
  const {
    notebooks,
    studyMetrics,
    studyTasks,
    documents,
    userStats,
    addDeadline,
    updateDeadline,
    deleteDeadline,
    completeDeadline,
    addMonthlyGoal,
    updateMonthlyGoal,
    deleteMonthlyGoal,
  } = useAppStore()

  const [isAddingDeadline, setIsAddingDeadline] = useState(false)
  const [editingDeadline, setEditingDeadline] = useState<Deadline | null>(null)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoalIndex, setEditingGoalIndex] = useState<number | null>(null)

  // Form states
  const [deadlineForm, setDeadlineForm] = useState({
    title: "",
    subject: "",
    dueDate: "",
    priority: "medium" as "low" | "medium" | "high",
  })
  const [goalForm, setGoalForm] = useState({ goal: "", target: 10 })

  const stats = useMemo(() => {
    const totalDocuments = Object.values(documents).reduce((sum, docs) => sum + (docs?.length || 0), 0)
    const completedTasks = studyTasks?.filter((t) => t.completed).length || 0
    const totalTasks = studyTasks?.length || 0

    return {
      totalNotebooks: notebooks?.length || 0,
      totalDocuments,
      completedTasks,
      totalTasks,
      taskCompletion: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
    }
  }, [notebooks, studyTasks, documents])

  const weeklyActivity = userStats?.weeklyActivity || [
    { day: "Mon", hours: 0 },
    { day: "Tue", hours: 0 },
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 0 },
    { day: "Sat", hours: 0 },
    { day: "Sun", hours: 0 },
  ]

  const maxHours = Math.max(...weeklyActivity.map((d) => d.hours), 1)

  const thisWeekActivity = useMemo(() => {
    const streakDays = userStats?.streakDays || []
    const today = new Date()
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek

    const weekDates: { date: string; active: boolean; label: string }[] = []
    const dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
    for (let i = 0; i < 7; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + mondayOffset + i)
      const dateStr = date.toISOString().split("T")[0]
      weekDates.push({
        date: dateStr,
        active: streakDays.includes(dateStr),
        label: dayLabels[i],
      })
    }
    return weekDates
  }, [userStats?.streakDays])

  const learningStreak = {
    current: userStats?.currentStreak || 0,
    longest: userStats?.longestStreak || 0,
    thisWeek: thisWeekActivity,
  }

  const skillLevels = useMemo(() => {
    const skills: { skill: string; level: number; color: string }[] = []
    const colors = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

    // Get skills from notebooks
    const notebookSkills = notebooks?.map((nb) => nb.subject) || []
    const userSkills = userStats?.skillLevels || []

    // Combine and dedupe
    const allSkills = new Set([...notebookSkills, ...userSkills.map((s) => s.skill)])

    Array.from(allSkills).forEach((skill, i) => {
      const existingSkill = userSkills.find((s) => s.skill === skill)
      const notebookProgress = notebooks?.find((nb) => nb.subject === skill)?.progress || 0
      const level = existingSkill?.level || Math.min(notebookProgress, 100)

      skills.push({
        skill,
        level,
        color: colors[i % colors.length],
      })
    })

    return skills
  }, [notebooks, userStats?.skillLevels])

  const monthlyGoals = userStats?.monthlyGoals || []

  const achievements = [
    {
      id: "daily-learner",
      title: "Daily Learner",
      icon: Sparkles,
      unlocked: userStats?.unlockedAchievements?.includes("daily-learner") || learningStreak.current >= 1,
      description: "Start your first streak",
    },
    {
      id: "first-quiz",
      title: "First Quiz",
      icon: Brain,
      unlocked: userStats?.unlockedAchievements?.includes("first-quiz") || (userStats?.totalQuizzesCompleted || 0) > 0,
      description: "Complete your first quiz",
    },
    {
      id: "bookworm",
      title: "Bookworm",
      icon: BookOpen,
      unlocked: userStats?.unlockedAchievements?.includes("bookworm") || stats.totalDocuments >= 5,
      description: "Upload 5 documents",
    },
    {
      id: "week-warrior",
      title: "Week Warrior",
      icon: Flame,
      unlocked: userStats?.unlockedAchievements?.includes("week-warrior") || learningStreak.current >= 7,
      description: "7-day streak",
    },
    {
      id: "quiz-master",
      title: "Quiz Master",
      icon: Trophy,
      unlocked:
        userStats?.unlockedAchievements?.includes("quiz-master") || (userStats?.totalQuizzesCompleted || 0) >= 10,
      description: "Complete 10 quizzes",
    },
    {
      id: "scholar",
      title: "Scholar",
      icon: GraduationCap,
      unlocked:
        userStats?.unlockedAchievements?.includes("scholar") || (userStats?.completedNotebooks?.length || 0) >= 3,
      description: "Complete 3 notebooks",
    },
    {
      id: "speed-learner",
      title: "Speed Learner",
      icon: Zap,
      unlocked:
        userStats?.unlockedAchievements?.includes("speed-learner") || (studyMetrics?.timeSpentMinutes || 0) >= 600,
      description: "Study for 10 hours",
    },
  ]

  // Calculate progress metrics from user data
  const progressMetrics = useMemo(() => {
    const totalNotebooks = notebooks?.length || 0
    const completedNotebooks = userStats?.completedNotebooks?.length || 0
    const coverage = totalNotebooks > 0 ? Math.round((completedNotebooks / totalNotebooks) * 100) : 0

    const totalQuestions = userStats?.totalQuizQuestions || 0
    const totalScore = userStats?.totalQuizScore || 0
    const accuracy = totalQuestions > 0 ? Math.round((totalScore / totalQuestions) * 100) : 0

    const completedTasks = studyTasks?.filter((t) => t.completed).length || 0
    const totalTasks = studyTasks?.length || 0
    const tasksProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

    return {
      coverage,
      accuracy,
      tasksCompleted: completedTasks,
      totalTasks,
      tasksProgress,
    }
  }, [notebooks, userStats, studyTasks])

  const handleDownloadPDF = () => {
    const data = {
      user: "Smart Study Hub User",
      exportDate: new Date().toLocaleDateString(),
      stats: {
        notebooks: stats.totalNotebooks,
        documents: stats.totalDocuments,
        tasksCompleted: progressMetrics.tasksCompleted,
        totalTasks: progressMetrics.totalTasks,
        streak: learningStreak.current,
        longestStreak: learningStreak.longest,
      },
      progress: {
        coverage: progressMetrics.coverage,
        accuracy: progressMetrics.accuracy,
        tasksProgress: progressMetrics.tasksProgress,
      },
      skills: skillLevels.map((s) => ({ skill: s.skill, level: s.level })),
      achievements: achievements.filter((a) => a.unlocked).map((a) => a.title),
      monthlyGoals: monthlyGoals.map((g) => ({ goal: g.goal, current: g.current, target: g.target })),
    }

    // Create text content for download
    let content = `SMART STUDY HUB - PROGRESS REPORT\n`
    content += `${"=".repeat(50)}\n`
    content += `Export Date: ${data.exportDate}\n\n`

    content += `STATISTICS\n`
    content += `${"-".repeat(30)}\n`
    content += `Notebooks: ${data.stats.notebooks}\n`
    content += `Documents: ${data.stats.documents}\n`
    content += `Tasks: ${data.stats.tasksCompleted}/${data.stats.totalTasks}\n`
    content += `Current Streak: ${data.stats.streak} days\n`
    content += `Longest Streak: ${data.stats.longestStreak} days\n\n`

    content += `PROGRESS\n`
    content += `${"-".repeat(30)}\n`
    content += `Coverage: ${data.progress.coverage}%\n`
    content += `Accuracy: ${data.progress.accuracy}%\n`
    content += `Tasks Progress: ${data.progress.tasksProgress}%\n\n`

    content += `SKILLS\n`
    content += `${"-".repeat(30)}\n`
    data.skills.forEach((s) => {
      content += `${s.skill}: ${s.level}%\n`
    })
    content += `\n`

    content += `ACHIEVEMENTS UNLOCKED\n`
    content += `${"-".repeat(30)}\n`
    data.achievements.forEach((a) => {
      content += `✓ ${a}\n`
    })
    content += `\n`

    content += `MONTHLY GOALS\n`
    content += `${"-".repeat(30)}\n`
    data.monthlyGoals.forEach((g) => {
      content += `${g.goal}: ${g.current}/${g.target}\n`
    })

    // Download as text file (simulating PDF)
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `study-hub-report-${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast.success("Report downloaded successfully!")
  }

  const handleAddDeadline = () => {
    if (!deadlineForm.title || !deadlineForm.dueDate) {
      toast.error("Please fill in title and due date")
      return
    }
    addDeadline({
      title: deadlineForm.title,
      subject: deadlineForm.subject || "General",
      dueDate: deadlineForm.dueDate,
      priority: deadlineForm.priority,
      completed: false,
    })
    setDeadlineForm({ title: "", subject: "", dueDate: "", priority: "medium" })
    setIsAddingDeadline(false)
    toast.success("Deadline added!")
  }

  const handleUpdateDeadline = () => {
    if (!editingDeadline) return
    updateDeadline(editingDeadline.id, {
      title: deadlineForm.title,
      subject: deadlineForm.subject,
      dueDate: deadlineForm.dueDate,
      priority: deadlineForm.priority,
    })
    setEditingDeadline(null)
    setDeadlineForm({ title: "", subject: "", dueDate: "", priority: "medium" })
    toast.success("Deadline updated!")
  }

  const handleAddGoal = () => {
    if (!goalForm.goal) {
      toast.error("Please enter a goal")
      return
    }
    addMonthlyGoal(goalForm.goal, goalForm.target)
    setGoalForm({ goal: "", target: 10 })
    setIsAddingGoal(false)
    toast.success("Goal added!")
  }

  const customDeadlines = userStats?.customDeadlines || []

  return (
    <div className="space-y-6">
      {/* Header with Download Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Your Progress</h2>
          <p className="text-muted-foreground">Track your learning journey</p>
        </div>
        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download Report
        </Button>
      </div>

      {/* Learning Streak Banner */}
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 to-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/20 rounded-full">
                <Flame className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-foreground">{learningStreak.current} Day Streak</h3>
                <p className="text-muted-foreground">Longest: {learningStreak.longest} days</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground mr-2">This Week:</span>
              {learningStreak.thisWeek.map((day, i) => (
                <div
                  key={i}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    day.active ? "bg-green-700 text-white shadow-md" : "bg-muted/50 text-muted-foreground"
                  }`}
                  title={day.date}
                >
                  {day.active ? <Check className="h-4 w-4" /> : day.label}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalNotebooks}</p>
                <p className="text-xs text-muted-foreground">Notebooks</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-2/20 rounded-lg">
                <FileText className="h-5 w-5 text-chart-2" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.totalDocuments}</p>
                <p className="text-xs text-muted-foreground">Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-3/20 rounded-lg">
                <Brain className="h-5 w-5 text-chart-3" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{userStats?.totalQuizzesCompleted || 0}</p>
                <p className="text-xs text-muted-foreground">Quizzes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-chart-4/20 rounded-lg">
                <Clock className="h-5 w-5 text-chart-4" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">
                  {Math.round((studyMetrics?.timeSpentMinutes || 0) / 60)}h
                </p>
                <p className="text-xs text-muted-foreground">Study Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Goals - Customizable */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Monthly Goals
          </CardTitle>
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Monthly Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Goal Description</Label>
                  <Input
                    placeholder="e.g., Complete 10 quizzes"
                    value={goalForm.goal}
                    onChange={(e) => setGoalForm((prev) => ({ ...prev, goal: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Target</Label>
                  <Input
                    type="number"
                    min={1}
                    value={goalForm.target}
                    onChange={(e) => setGoalForm((prev) => ({ ...prev, target: Number.parseInt(e.target.value) || 1 }))}
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddGoal}>Add Goal</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-4">
          {monthlyGoals.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No goals yet. Add your first goal!</p>
          ) : (
            monthlyGoals.map((goal, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground">{goal.goal}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-primary">
                      {goal.current}/{goal.target}
                    </span>
                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => deleteMonthlyGoal(idx)}>
                      <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                    </Button>
                  </div>
                </div>
                <Progress value={(goal.current / goal.target) * 100} className="h-2" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Weekly Activity & Skill Proficiency */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Weekly Study Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Weekly Study Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between h-32 gap-2">
              {weeklyActivity.map((day) => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full bg-primary/80 rounded-t transition-all"
                    style={{
                      height: `${(day.hours / maxHours) * 100}%`,
                      minHeight: day.hours > 0 ? "8px" : "2px",
                    }}
                  />
                  <span className="text-xs text-muted-foreground">{day.day}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              Total: {weeklyActivity.reduce((sum, d) => sum + d.hours, 0).toFixed(1)} hours this week
            </p>
          </CardContent>
        </Card>

        {/* Skill Proficiency - Based on Notebook Subjects */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Skill Proficiency
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {skillLevels.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Create notebooks to track skill proficiency</p>
            ) : (
              skillLevels.map((skill, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground">{skill.skill}</span>
                    <span className="text-muted-foreground">{skill.level}%</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full ${skill.color} transition-all duration-500`}
                      style={{ width: `${skill.level}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-3">
              <span className="text-2xl font-bold text-primary">{progressMetrics.coverage}%</span>
            </div>
            <h4 className="font-medium text-foreground">Coverage</h4>
            <p className="text-xs text-muted-foreground">Notebooks completed</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-2/20 mb-3">
              <span className="text-2xl font-bold text-chart-2">{progressMetrics.accuracy}%</span>
            </div>
            <h4 className="font-medium text-foreground">Accuracy</h4>
            <p className="text-xs text-muted-foreground">Quiz performance</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-chart-3/20 mb-3">
              <span className="text-2xl font-bold text-chart-3">
                {progressMetrics.tasksCompleted}/{progressMetrics.totalTasks}
              </span>
            </div>
            <h4 className="font-medium text-foreground">Tasks</h4>
            <p className="text-xs text-muted-foreground">Completed tasks</p>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines - Customizable */}
      <Card className="bg-card border-border">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Deadlines
          </CardTitle>
          <Dialog open={isAddingDeadline} onOpenChange={setIsAddingDeadline}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1 bg-transparent">
                <Plus className="h-4 w-4" />
                Add Deadline
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Deadline</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="e.g., Final Exam"
                    value={deadlineForm.title}
                    onChange={(e) => setDeadlineForm((prev) => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Subject</Label>
                  <Input
                    placeholder="e.g., Mathematics"
                    value={deadlineForm.subject}
                    onChange={(e) => setDeadlineForm((prev) => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Input
                    type="date"
                    value={deadlineForm.dueDate}
                    onChange={(e) => setDeadlineForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={deadlineForm.priority}
                    onValueChange={(v) =>
                      setDeadlineForm((prev) => ({ ...prev, priority: v as "low" | "medium" | "high" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddDeadline}>Add Deadline</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          {customDeadlines.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No deadlines yet. Add your first deadline!</p>
          ) : (
            <div className="space-y-3">
              {customDeadlines
                .filter((d) => !d.completed)
                .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .map((deadline) => {
                  const daysLeft = Math.ceil(
                    (new Date(deadline.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24),
                  )
                  return (
                    <div key={deadline.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
                      <div className="flex items-center gap-3">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => completeDeadline(deadline.id)}
                        >
                          <CheckCircle2 className="h-4 w-4 text-muted-foreground hover:text-primary" />
                        </Button>
                        <div>
                          <p className="text-sm font-medium text-foreground">{deadline.title}</p>
                          <p className="text-xs text-muted-foreground">{deadline.subject}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={
                            deadline.priority === "high"
                              ? "border-destructive text-destructive"
                              : deadline.priority === "medium"
                                ? "border-warning text-warning"
                                : "border-muted-foreground"
                          }
                        >
                          {daysLeft <= 0 ? "Overdue" : `${daysLeft}d left`}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-6 w-6"
                          onClick={() => deleteDeadline(deadline.id)}
                        >
                          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements - Ordered from easiest */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon
              return (
                <div
                  key={achievement.id}
                  className={`flex flex-col items-center p-3 rounded-lg transition-all ${
                    achievement.unlocked ? "bg-primary/20 border border-primary/30" : "bg-muted/30 opacity-50"
                  }`}
                  title={achievement.description}
                >
                  <Icon className={`h-6 w-6 mb-2 ${achievement.unlocked ? "text-primary" : "text-muted-foreground"}`} />
                  <span
                    className={`text-xs text-center font-medium ${achievement.unlocked ? "text-foreground" : "text-muted-foreground"}`}
                  >
                    {achievement.title}
                  </span>
                  {achievement.unlocked && <Badge className="mt-1 text-xs bg-primary/30">Unlocked</Badge>}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* AI Study Tips */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-primary" />
            AI Study Tips
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              stats.totalNotebooks === 0
                ? "Create your first notebook to start tracking your learning progress!"
                : "Review your notebooks regularly to improve retention.",
              progressMetrics.accuracy < 70
                ? "Focus on understanding concepts before taking more quizzes."
                : "Great quiz performance! Challenge yourself with harder questions.",
              learningStreak.current < 3
                ? "Build a daily study habit - even 15 minutes counts!"
                : "Excellent streak! Keep the momentum going.",
            ].map((tip, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <Sparkles className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground">{tip}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
