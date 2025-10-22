import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  FileText,
  Camera,
  Edit3,
  Plus,
  ArrowUpDown,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useTradeStore } from "@/store/trade-store";
import { useEffect, useState } from "react";

// Sample trade data - can be easily replaced with API data
// const tradeData = {
//   id: "TRD-2024-001",
//   symbol: "RELIANCE",
//   fullName: "Reliance Industries Limited",
//   tradeType: "BUY",
//   status: "CLOSED",
//   entryDate: "2024-01-15",
//   exitDate: "2024-01-22",
//   entryPrice: 2450.75,
//   exitPrice: 2628.5,
//   quantity: 100,
//   targetPrice: 2650.0,
//   stopLoss: 2380.0,
//   commission: 245.5,
//   absolutePL: 17529.25,
//   percentPL: 7.25,
//   riskReward: 2.54,
//   duration: "7 days",
//   atr: 45.2,
//   volatility: 18.5,
//   relativeStrength: "+2.3% vs Nifty",
//   notes:
//     "Strong breakout above resistance level with high volume. Good momentum continuation play.",
//   reflection:
//     "Trade executed as per plan. Could have held longer for better gains.",
//   strategyAdherence: "Excellent - followed all entry and exit rules",
//   tags: ["Momentum", "Breakout", "Large Cap"],
//   attachments: [
//     { id: 1, name: "Entry Chart", type: "image" },
//     { id: 2, name: "Exit Analysis", type: "image" },
//   ],
// };

const relatedTrades = [
  { date: "2024-01-08", type: "SELL", quantity: 50, pl: -1250.0 },
  { date: "2023-12-20", type: "BUY", quantity: 75, pl: 3420.5 },
  { date: "2023-12-10", type: "BUY", quantity: 100, pl: 2180.75 },
];

const TradeDetails = () => {
  const { id } = useParams<{ id: string }>();
  const fetchTradeById = useTradeStore((s) => s.fetchTradeById);
  const [tradeData, setTradeData] = useState<any>(null);

  useEffect(() => {
    if (id) {
      fetchTradeById(id).then((data) => {
        setTradeData(data);
      });
    }
  }, [id, fetchTradeById]);

  const isProfitable = tradeData?.absolutePL > 0;
  const hitTarget = tradeData?.exitPrice >= tradeData?.targetPrice * 0.95; // Within 5% of target
  const stoppedOut = tradeData?.exitPrice <= tradeData?.stopLoss * 1.05; // Within 5% of stop loss

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="@container/main mx-auto gap-2 space-y-6">
        {/* Header Section */}
        <Card className="shadow-card bg-gradient-card">
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold">{tradeData?.symbol}</h1>
                  <Badge
                    variant={
                      tradeData?.tradeType === "BUY" ? "default" : "secondary"
                    }
                  >
                    {tradeData?.tradeType}
                  </Badge>
                  <Badge
                    variant={
                      tradeData?.status === "CLOSED" ? "outline" : "default"
                    }
                    className={
                      tradeData?.status === "CLOSED"
                        ? "border-muted-foreground"
                        : ""
                    }
                  >
                    {tradeData?.status}
                  </Badge>
                </div>
                <p className="text-lg text-muted-foreground">
                  {tradeData?.fullName}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {isProfitable && (
                  <Badge className="bg-profit text-profit-foreground">
                    Profitable
                  </Badge>
                )}
                {hitTarget && (
                  <Badge className="bg-gradient-profit text-profit-foreground">
                    Hit Target
                  </Badge>
                )}
                {stoppedOut && (
                  <Badge className="bg-loss text-loss-foreground">
                    Stopped Out
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card
            className={`shadow-card ${
              isProfitable ? "shadow-profit" : "shadow-loss"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Net P&L
                  </p>
                  <p
                    className={`text-2xl font-bold ${
                      isProfitable ? "text-profit" : "text-loss"
                    }`}
                  >
                    ₹{tradeData?.absolutePL}
                  </p>
                  <p
                    className={`text-sm ${
                      isProfitable ? "text-profit" : "text-loss"
                    }`}
                  >
                    {isProfitable ? "+" : ""}
                    {tradeData?.percentPL}%
                  </p>
                </div>
                {isProfitable ? (
                  <TrendingUp className="w-8 h-8 text-profit" />
                ) : (
                  <TrendingDown className="w-8 h-8 text-loss" />
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Risk-Reward
                  </p>
                  <p className="text-2xl font-bold">
                    1:{tradeData?.riskReward}
                  </p>
                  <p className="text-sm text-muted-foreground">Ratio</p>
                </div>
                <Target className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Position Size
                  </p>
                  <p className="text-2xl font-bold">{tradeData?.quantity}</p>
                  <p className="text-sm text-muted-foreground">Shares</p>
                </div>
                <BarChart3 className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Duration
                  </p>
                  <p className="text-2xl font-bold">
                    {tradeData?.duration?.split(" ")[0]}
                  </p>
                  <p className="text-sm text-muted-foreground">Days</p>
                </div>
                <Clock className="w-8 h-8 text-primary" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="attachments">Attachments</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
            <TabsTrigger value="commission">Commission</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trade Details */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Trade Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Entry Date
                      </Label>
                      <p className="font-medium">
                        {new Date(tradeData?.entryDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Exit Date
                      </Label>
                      <p className="font-medium">
                        {new Date(tradeData?.exitDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Entry Price
                      </Label>
                      <p className="font-medium">₹{tradeData?.entryPrice}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Exit Price
                      </Label>
                      <p className="font-medium">₹{tradeData?.exitPrice}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Target Price
                      </Label>
                      <p className="font-medium text-profit">
                        ₹{tradeData?.targetPrice}
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">
                        Stop Loss
                      </Label>
                      <p className="font-medium text-loss">
                        ₹{tradeData?.stopLoss}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">
                      Commission & Fees
                    </Label>
                    <p className="font-medium">₹{tradeData?.commission}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Performance Metrics */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Performance Metrics
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Absolute P&L
                      </span>
                      <span
                        className={`font-bold ${
                          isProfitable ? "text-profit" : "text-loss"
                        }`}
                      >
                        ₹{tradeData?.absolutePL?.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Percentage P&L
                      </span>
                      <span
                        className={`font-bold ${
                          isProfitable ? "text-profit" : "text-loss"
                        }`}
                      >
                        {tradeData?.percentPL}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Risk-Reward Ratio
                      </span>
                      <span className="font-bold">
                        1:{tradeData?.riskReward}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Trade Duration
                      </span>
                      <span className="font-bold">{tradeData?.duration}</span>
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        ATR at Entry
                      </span>
                      <span className="font-medium">₹{tradeData?.atr}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        Volatility
                      </span>
                      <span className="font-medium">
                        {tradeData?.volatility}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">
                        vs Nifty
                      </span>
                      <span className="font-medium text-profit">
                        {tradeData?.relativeStrength}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Chart Placeholder */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Price Movement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <BarChart3 className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      Chart will be integrated here
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entry: ₹{tradeData?.entryPrice} → Exit: ₹
                      {tradeData?.exitPrice}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trade Notes */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Trade Notes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="entry-notes">Entry Rationale</Label>
                    <Textarea
                      id="entry-notes"
                      value={tradeData?.notes}
                      readOnly
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="reflection">Post-Trade Reflection</Label>
                    <Textarea
                      id="reflection"
                      value={tradeData?.reflection}
                      readOnly
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="strategy">Strategy Adherence</Label>
                    <Input
                      id="strategy"
                      value={tradeData?.strategyAdherence}
                      readOnly
                      className="mt-2"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Tags and Actions */}
              <Card className="shadow-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Tags & Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Strategy Tags</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {tradeData?.tags.map((tag: any, index: any) => (
                        <Badge key={index} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                  <div className="space-y-2">
                    <Button className="w-full" variant="outline">
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Trade Details
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Notes
                    </Button>
                    <Button className="w-full" variant="outline">
                      <Camera className="w-4 h-4 mr-2" />
                      Upload Image
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="attachments" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Trade Attachments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {tradeData?.attachments?.map((attachment: any) => (
                    <div
                      key={attachment.id}
                      className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="h-32 bg-muted rounded-lg flex items-center justify-center mb-3">
                        <Camera className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="font-medium text-sm">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {attachment.type}
                      </p>
                    </div>
                  ))}
                  <div className="border border-dashed border-border rounded-lg p-4 flex flex-col items-center justify-center hover:border-primary/50 transition-colors cursor-pointer">
                    <Plus className="w-8 h-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Add New</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Related Trades - {tradeData?.symbol}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead className="text-right">P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {relatedTrades.map((trade, index) => (
                      <TableRow key={index}>
                        <TableCell>
                          {new Date(trade.date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trade.type === "BUY" ? "default" : "secondary"
                            }
                          >
                            {trade.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{trade.quantity}</TableCell>
                        <TableCell
                          className={`text-right font-medium ${
                            trade.pl > 0 ? "text-profit" : "text-loss"
                          }`}
                        >
                          ₹{trade.pl.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="commission" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ArrowUpDown className="w-5 h-5" />
                  Related Trades - {tradeData?.symbol}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Charges Breakdown Table */}
                {tradeData?.chargesBreakdown && (
                  <div>
                    <h3 className="text-sm font-semibold mb-2">
                      Charges Breakdown
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Charge</TableHead>
                          <TableHead className="text-right">
                            Amount (₹)
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(
                          tradeData.chargesBreakdown as Record<string, any>
                        ).map(([key, value]) => (
                          <TableRow key={key}>
                            <TableCell className="capitalize">
                              {key.replace(/([A-Z])/g, " $1")}
                            </TableCell>
                            <TableCell className="text-right">
                              {(value as number).toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TradeDetails;
