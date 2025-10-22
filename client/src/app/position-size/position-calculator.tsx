"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { usePositionSizeStore } from "@/store/position-size-stote";
import PositionSizeTable from "./position-size-table";
import { useNavigate } from "react-router-dom";
import Loader from "@/components/loader";

const atrBasedSchema = z.object({
  stockName: z.string().min(1, "Stock name is required"),
  entryPrice: z.number().positive("Entry price must be positive"),
  atr: z.number().positive("ATR must be positive"),
  atrMultiplier: z.number().positive("ATR multiplier must be positive"),
  riskPercentage: z.number().positive("Risk % must be positive"),
});

type ATRBasedFormValues = z.infer<typeof atrBasedSchema>;

export default function PositionSizingPage() {
  const navigate = useNavigate();
  const [calculatedPositionSize, setCalculatedPositionSize] = useState(0);
  const { loading, addPosition, fetchPositions } = usePositionSizeStore();

  console.log(calculatedPositionSize);

  const atrBasedForm = useForm<ATRBasedFormValues>({
    resolver: zodResolver(atrBasedSchema),
    defaultValues: {
      stockName: "",
      atrMultiplier: 1,
      riskPercentage: 0.5,
    },
  });

  const calculateATRBased = async (values: ATRBasedFormValues) => {
    try {
      const data = await addPosition(values);
      setCalculatedPositionSize(data.positionSize);
      await fetchPositions();
    } catch (err) {
      console.error("Calculation failed:", err);
    }
  };

  const clearATRBasedForm = () => {
    atrBasedForm.reset();
    setCalculatedPositionSize(0);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-4 md:p-6">
      <div className="@container/main mx-auto gap-2 space-y-6">
        <div className="flex items-center justify-between bg-card backdrop-blur-sm rounded-lg p-6 border">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Position Size Calculator
            </h1>
            <p className="text-md">
              Calculate the optimal position size for each trade using your
              ATR-based risk management strategy.
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

        <Card>
          <CardContent>
            <Form {...atrBasedForm}>
              <form
                onSubmit={atrBasedForm.handleSubmit(calculateATRBased)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Stock Name */}
                  <FormField
                    control={atrBasedForm.control}
                    name="stockName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Stock Name</FormLabel>
                        <FormControl>
                          <Input placeholder="TCS" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Entry Price */}
                  <FormField
                    control={atrBasedForm.control}
                    name="entryPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Entry Price (₹)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="500.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ATR */}
                  <FormField
                    control={atrBasedForm.control}
                    name="atr"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATR (14)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.01"
                            placeholder="10.00"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* ATR Multiplier */}
                  <FormField
                    control={atrBasedForm.control}
                    name="atrMultiplier"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>ATR Multiplier (k)</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="1.5"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Risk Percentage */}
                  <FormField
                    control={atrBasedForm.control}
                    name="riskPercentage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Risk % per Trade</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="1.0"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="submit" className="text-white">
                    Calculate
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={clearATRBasedForm}
                  >
                    Clear
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <PositionSizeTable />
      </div>
    </div>
  );
}
