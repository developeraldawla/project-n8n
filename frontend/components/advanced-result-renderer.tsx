"use client"

import React from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, FileText } from 'lucide-react';

interface AdvancedResultProps {
    result: any;
}

export function AdvancedResultRenderer({ result }: AdvancedResultProps) {
    if (!result || result.type !== 'FILE_OUTPUT') {
        return (
            <div className="p-4 bg-muted rounded-md overflow-auto max-h-96">
                <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
        );
    }

    const { file, data, visualization } = result;

    return (
        <div className="space-y-6">
            {/* File Download Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Generated File
                    </CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <p className="text-2xl font-bold">{file.extension.toUpperCase()}</p>
                            <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                            </p>
                        </div>
                        <Button asChild size="sm">
                            <a href={file.url} download target="_blank" rel="noopener noreferrer">
                                <Download className="mr-2 h-4 w-4" />
                                Download
                            </a>
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Visualization */}
            {visualization && data && (
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>{visualization.title || 'Data Analysis'}</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                {visualization.suggestedChart === 'bar' ? (
                                    <BarChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey={visualization.xAxis}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))' }}
                                            itemStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Legend />
                                        {visualization.yAxis.map((key: string, index: number) => (
                                            <Bar
                                                key={key}
                                                dataKey={key}
                                                fill={index % 2 === 0 ? "currentColor" : "#82ca9d"}
                                                radius={[4, 4, 0, 0]}
                                                className="fill-primary"
                                            />
                                        ))}
                                    </BarChart>
                                ) : (
                                    <LineChart data={data}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey={visualization.xAxis}
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#888888"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <Tooltip />
                                        <Legend />
                                        {visualization.yAxis.map((key: string, index: number) => (
                                            <Line
                                                key={key}
                                                type="monotone"
                                                dataKey={key}
                                                stroke="currentColor"
                                                strokeWidth={2}
                                                className="stroke-primary"
                                            />
                                        ))}
                                    </LineChart>
                                )}
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Raw Data Preview (First 5 Rows) */}
            {data && (
                <Card>
                    <CardHeader>
                        <CardTitle>Data Preview</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted">
                                    <tr>
                                        {Object.keys(data[0] || {}).map(key => (
                                            <th key={key} className="p-2 border-b font-medium">{key}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.slice(0, 5).map((row: any, i: number) => (
                                        <tr key={i} className="border-b">
                                            {Object.values(row).map((val: any, j: number) => (
                                                <td key={j} className="p-2">{String(val)}</td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
