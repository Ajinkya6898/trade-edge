import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Plus,
  Minus,
  Calendar,
  FileText,
  DollarSign,
} from "lucide-react";
import { toast } from "sonner";
import { useCapitalStore } from "@/store/capital-store";
import { useNavigate } from "react-router-dom";

const capitalSchema = z.object({
  type: z.enum(["add", "withdraw"]),
  amount: z.number().positive("Amount must be greater than 0"),
  note: z.string().optional(),
});

type CapitalFormData = z.infer<typeof capitalSchema>;

export default function CapitalManagement() {
  const navigate = useNavigate();
  const [portfolio, setPortfolio] = useState({
    totalCapital: 50000,
    availableCapital: 35000,
  });
  const [activeTab, setActiveTab] = useState("add");
  const [loading, setLoading] = useState(false);

  const form = useForm<CapitalFormData>({
    resolver: zodResolver(capitalSchema),
    defaultValues: {
      type: "add",
      amount: undefined,
      note: "",
    },
  });
  const { capital, fetchCapital, addCapital, withdrawCapital } =
    useCapitalStore();

  useEffect(() => {
    fetchCapital();
  }, []);

  const transactions: any = capital || [];

  useEffect(() => {
    if (capital) {
      setPortfolio({
        totalCapital: capital.totalCapital,
        availableCapital: capital.totalCapital, // Adjust this based on your logic
      });
    }
  }, [capital]);

  const onSubmit = async (data: CapitalFormData) => {
    setLoading(true);
    try {
      const { type, amount, note } = data;

      console.log("data", data);

      if (type === "withdraw" && amount > portfolio.availableCapital) {
        toast.error("Withdrawal amount exceeds available capital");
        setLoading(false);
        return;
      }

      // Call the appropriate store method
      if (type === "add") {
        await addCapital(amount, note);
        toast.success("Capital added successfully!");
      } else {
        // Fix 3: Update activeTab to match the API expectation
        await withdrawCapital(amount, note);
        toast.success("Capital withdrawn successfully!");
      }

      form.reset({ type, amount: undefined, note: "" });
      setLoading(false);

      // Fix 4: Refetch to ensure we have latest data
      await fetchCapital();
    } catch (error) {
      toast.error(`Failed to ${data.type} capital`);
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="@container/main mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between bg-card backdrop-blur-sm rounded-lg p-6 border">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Capital Management
            </h1>
            <p className="text-md">
              Manage your investment capital and track transactions
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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Transaction Form */}
          <Card className="lg:col-span-1 shadow-sm border-l-4 border-l-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                Manage Capital
              </CardTitle>
              <CardDescription>
                Add or withdraw capital from your portfolio
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs
                value={activeTab}
                onValueChange={(val) => {
                  setActiveTab(val);
                  form.setValue("type", val as "add" | "withdraw");
                }}
              >
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="add" className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add
                  </TabsTrigger>
                  <TabsTrigger
                    value="withdraw"
                    className="flex items-center gap-2"
                  >
                    <Minus className="h-4 w-4" />
                    Withdraw
                  </TabsTrigger>
                </TabsList>

                <Form {...form}>
                  <div className="space-y-4 mt-4">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Amount (₹)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              placeholder="Enter amount"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                              className="text-lg"
                            />
                          </FormControl>
                          {activeTab === "withdraw" && (
                            <FormDescription>
                              Available:{" "}
                              {formatCurrency(portfolio.availableCapital)}
                            </FormDescription>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="note"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Note (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Add a note about this transaction..."
                              {...field}
                              rows={3}
                            />
                          </FormControl>
                          <FormDescription>
                            Document the reason for this transaction
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="button"
                      onClick={() => form.handleSubmit(onSubmit)()}
                      className="w-full"
                      disabled={loading}
                    >
                      {activeTab === "add" ? (
                        <Plus className="h-4 w-4 mr-2" />
                      ) : (
                        <Minus className="h-4 w-4 mr-2" />
                      )}
                      {loading
                        ? "Processing..."
                        : `${activeTab === "add" ? "Add" : "Withdraw"} Capital`}
                    </Button>
                  </div>
                </Form>
              </Tabs>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="lg:col-span-2 shadow-sm border-l-4 border-l-orange-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-orange-500" />
                Transaction History
              </CardTitle>
              <CardDescription>
                View all your capital transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {transactions.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Wallet className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p>No transactions yet</p>
                    <p className="text-sm mt-1">
                      Start by adding capital to your portfolio
                    </p>
                  </div>
                ) : (
                  transactions.map((transaction: any) => (
                    <div
                      key={transaction._id}
                      className="flex items-start justify-between p-4 rounded-lg border bg-card hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className={`p-2 rounded-full ${
                            transaction.type === "add"
                              ? "bg-green-100 text-green-600 dark:bg-green-900/20"
                              : "bg-red-100 text-red-600 dark:bg-red-900/20"
                          }`}
                        >
                          {transaction.type === "add" ? (
                            <TrendingUp className="h-5 w-5" />
                          ) : (
                            <TrendingDown className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <Badge
                              variant={
                                transaction.type === "add"
                                  ? "default"
                                  : "destructive"
                              }
                            >
                              {transaction.type === "add"
                                ? "Added"
                                : "Withdrawn"}
                            </Badge>
                            <span
                              className={`text-lg font-bold ${
                                transaction.type === "add"
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {transaction.type === "add" ? "+" : "-"}
                              {formatCurrency(transaction.amount)}
                            </span>
                          </div>
                          {transaction.note && (
                            <div className="flex items-start gap-1 text-sm text-muted-foreground mb-2">
                              <FileText className="h-4 w-4 mt-0.5 flex-shrink-0" />
                              <span className="break-words">
                                {transaction.note}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatDate(transaction.date)}
                            </div>
                            <div>
                              Balance:{" "}
                              {formatCurrency(transaction.balanceAfter)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
