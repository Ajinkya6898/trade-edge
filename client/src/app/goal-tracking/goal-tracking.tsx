import { useState, useEffect } from "react";
import { useGoalStore } from "@/store/goal-tracking-store";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Target,
  TrendingUp,
  CheckCircle,
  Calendar as CalIcon,
  Loader2,
  CheckCircle2,
  Clock,
  XCircle,
  IndianRupee,
} from "lucide-react";
import { toast } from "sonner";
import { StatCard } from "@/components/stat-card";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/loader";

export default function GoalTracking() {
  const navigate = useNavigate();
  const {
    progress,
    loading,
    error,
    createLoading,
    createError,
    fetchGoalProgress,
    createGoal,
    resetCreateState,
  } = useGoalStore();

  const [capital, setCapital] = useState("");
  const [expectedReturns, setExpectedReturns] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [timePeriod, setTimePeriod] = useState("12");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch goal progress on mount
  useEffect(() => {
    fetchGoalProgress();
  }, [fetchGoalProgress]);

  // Handle fetch errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  // Handle create errors
  useEffect(() => {
    if (createError) {
      toast.error(createError);
    }
  }, [createError]);

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!capital || Number(capital) <= 0) {
      newErrors.capital = "Capital must be positive";
    }

    if (!expectedReturns || Number(expectedReturns) <= 0) {
      newErrors.expectedReturns = "Returns must be positive";
    } else if (Number(expectedReturns) > 1000) {
      newErrors.expectedReturns = "Returns seem unrealistic";
    }

    if (!startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!timePeriod || Number(timePeriod) <= 0) {
      newErrors.timePeriod = "Time period must be positive";
    } else if (Number(timePeriod) > 60) {
      newErrors.timePeriod = "Max 60 months";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    resetCreateState();

    const success = await createGoal({
      totalCapital: Number(capital),
      startDate: startDate!.toISOString(),
      expectedReturnPercent: Number(expectedReturns),
      timePeriod: Number(timePeriod),
    });

    if (success) {
      toast.success("Goal created successfully!");
      setCapital("");
      setExpectedReturns("");
      setStartDate(undefined);
      setTimePeriod("12");
      setErrors({});
    }
  };

  const getStatusIcon = (status: any) => {
    switch (status) {
      case "Achieved":
        return <CheckCircle2 className="h-3.5 w-3.5" />;
      case "Active":
        return <Clock className="h-3.5 w-3.5" />;
      case "Pending":
        return <Clock className="h-3.5 w-3.5" />;
      case "Upcoming":
        return <Clock className="h-3.5 w-3.5" />;
      default:
        return <XCircle className="h-3.5 w-3.5" />;
    }
  };

  const getBorderColor = (month: any) => {
    if (Number(month.earned) >= Number(month.targetAmount)) {
      return "border-l-green-500";
    }
    if (month.status === "Active" || month.status === "Pending") {
      return "border-l-orange-200";
    }
    return "border-l-slate-400";
  };

  const getProgressColor = (month: any) => {
    if (Number(month.earned) >= Number(month.targetAmount)) {
      return "bg-green-500";
    }
    if (month.status === "Active" || month.status === "Pending") {
      return "bg-orange-500";
    }
    return "bg-slate-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Achieved":
        return "bg-green-100 text-green-800 border-green-300";
      case "Not Achieved":
        return "bg-red-100 text-red-800 border-red-300";
      case "Pending":
        return "border-slate-300";
      default:
        return "";
    }
  };

  const progressPercentage =
    progress?.goalActive && progress.totalExpectedReturnAmount
      ? ((progress.achievedAmount || 0) / progress.totalExpectedReturnAmount) *
        100
      : 0;

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="@container/main mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-card backdrop-blur-sm rounded-lg p-6 border">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Goal Setting & Tracking
            </h1>
            <p className=" text-md">
              Set your annual/periodic return goals and track monthly progress
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="shadow-sm"
          >
            Back to Dashboard
          </Button>
        </div>

        {/* Summary Stats */}
        {progress?.goalActive && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              description="Starting Capital"
              value={`₹ ${progress.totalCapital?.toLocaleString()}`}
              badgeText="Initial"
              badgeIcon={<IndianRupee className="h-3 w-3" />}
              badgeColor="text-blue-400"
              footerTitle="Portfolio Value"
              footerDesc="Your trading capital"
              borderColor="border-l-blue-400"
            />

            <StatCard
              description="Target Profit"
              value={`₹ ${progress.totalExpectedReturnAmount?.toLocaleString(
                "en-IN",
                { maximumFractionDigits: 0 }
              )}`}
              badgeText={`${progress.expectedReturnPercent}%`}
              badgeIcon={<Target className="h-3 w-3" />}
              badgeColor="text-emerald-400"
              footerTitle="Expected Returns"
              footerDesc="Goal for this period"
              borderColor="border-l-emerald-400"
            />

            <StatCard
              description="Actual Profit"
              value={`₹ ${(progress.achievedAmount || 0).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 0 }
              )}`}
              badgeText={`${progress.totalReturnPercent}%`}
              badgeIcon={<TrendingUp className="h-3 w-3" />}
              badgeColor="text-purple-400"
              footerTitle="Achieved"
              footerDesc="Current total profit"
              borderColor="border-l-purple-400"
            />

            <StatCard
              description="Progress"
              value={`${progressPercentage.toFixed(1)}%`}
              badgeText={progress.goalStatus || "In Progress"}
              badgeIcon={<CheckCircle className="h-3 w-3" />}
              badgeColor={
                progress.goalStatus === "Achieved"
                  ? "text-green-400"
                  : progress.goalStatus === "Expired"
                  ? "text-red-400"
                  : "text-orange-400"
              }
              footerTitle="Remaining"
              footerDesc={`₹ ${(progress.remainingAmount || 0).toLocaleString(
                "en-IN",
                { maximumFractionDigits: 0 }
              )}`}
              borderColor="border-l-orange-400"
            />
          </div>
        )}

        {/* Goal Setting Form */}
        {!progress?.goalActive && (
          <Card className="shadow-sm border-l-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Create New Goal
              </CardTitle>
              <CardDescription>
                Define your trading goals and expected returns over a specific
                period
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Starting Capital (₹)
                    </label>
                    <Input
                      type="number"
                      placeholder="100000"
                      value={capital}
                      onChange={(e) => setCapital(e.target.value)}
                      disabled={createLoading}
                    />
                    <p className="text-xs">Your current portfolio value</p>
                    {errors.capital && (
                      <p className="text-xs text-red-600">{errors.capital}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Expected Returns (%)
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="15"
                      value={expectedReturns}
                      onChange={(e) => setExpectedReturns(e.target.value)}
                      disabled={createLoading}
                    />
                    <p className="text-xs">Target return percentage</p>
                    {errors.expectedReturns && (
                      <p className="text-xs text-red-600">
                        {errors.expectedReturns}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2 flex flex-col">
                    <label className="text-sm font-medium">Start Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={`w-full justify-start text-left font-normal ${
                            !startDate && "text-slate-500"
                          }`}
                          disabled={createLoading}
                        >
                          {startDate ? (
                            formatDate(startDate.toISOString())
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={setStartDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <p className="text-xs">Goal start date</p>
                    {errors.startDate && (
                      <p className="text-xs text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Time Period (Months)
                    </label>
                    <Input
                      type="number"
                      placeholder="12"
                      value={timePeriod}
                      onChange={(e) => setTimePeriod(e.target.value)}
                      disabled={createLoading}
                    />
                    <p className="text-xs">Duration in months</p>
                    {errors.timePeriod && (
                      <p className="text-xs text-red-600">
                        {errors.timePeriod}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmit}
                    size="lg"
                    disabled={createLoading}
                  >
                    {createLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      "Create Goal"
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Tracking */}
        <div className="min-h-screen">
          {progress?.goalActive && progress.monthlyDistribution && (
            <Card className="shadow-sm border-l-4 border-l-emerald-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Monthly Progress Tracking
                </CardTitle>
                <CardDescription>
                  Track your performance against monthly targets •{" "}
                  <Badge
                    variant={
                      progress.goalStatus === "Achieved"
                        ? "default"
                        : progress.goalStatus === "Expired"
                        ? "destructive"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {progress.goalStatus}
                  </Badge>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {progress.monthlyDistribution.map((month, index) => {
                    const monthlyProgress =
                      (Number(month.earned) / Number(month.targetAmount)) * 100;

                    return (
                      <Card
                        key={index}
                        className={`@container/card shadow-sm border-l-4 hover:shadow-md transition-shadow duration-200 ${getBorderColor(
                          month
                        )}`}
                      >
                        <CardHeader>
                          <CardDescription>{month.month}</CardDescription>
                          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                            Month {index + 1}
                          </CardTitle>
                          <CardAction>
                            <Badge
                              variant="outline"
                              className={`flex items-center gap-1 ${getStatusColor(
                                month.status
                              )}`}
                            >
                              <span>{getStatusIcon(month.status)}</span>
                              {month.status}
                            </Badge>
                          </CardAction>
                        </CardHeader>

                        <div className="px-6 space-y-3 pb-4">
                          <div className="flex justify-between items-center">
                            <span className="text-sm ">Expected</span>
                            <span className="text-base font-semibold tabular-nums">
                              ₹
                              {Number(month.targetAmount).toLocaleString(
                                "en-IN",
                                {
                                  maximumFractionDigits: 0,
                                }
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-sm ">Actual</span>
                            <span>
                              ₹
                              {Number(month.earned).toLocaleString("en-IN", {
                                maximumFractionDigits: 0,
                              })}
                            </span>
                          </div>

                          <div className="space-y-1.5 pt-2">
                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${getProgressColor(
                                  month
                                )}`}
                                style={{
                                  width: `${Math.min(monthlyProgress, 100)}%`,
                                }}
                              />
                            </div>
                            <p className="text-xs text-right  tabular-nums">
                              {monthlyProgress.toFixed(1)}%
                            </p>
                          </div>
                        </div>

                        <CardFooter className="flex-col items-start gap-1.5 text-sm">
                          <div className="line-clamp-1 flex gap-2 font-medium">
                            Progress Tracking
                          </div>
                          <div className="">
                            {Number(month.earned) >= Number(month.targetAmount)
                              ? "Target achieved"
                              : `₹ ${(
                                  Number(month.targetAmount) -
                                  Number(month.earned)
                                ).toLocaleString("en-IN")} remaining`}
                          </div>
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {!progress?.goalActive && !loading && (
          <Card className="shadow-sm border-dashed border-2 border-slate-300">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Target className="h-16 w-16 text-slate-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Goal</h3>
              <p className="text-sm text-slate-500 max-w-md">
                Create your first trading goal to start tracking your monthly
                progress and stay on target with your returns.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
