import React, { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Download, Search, Filter, Trash2, Eye, FileText, Code } from "lucide-react";
import { toast } from "sonner";
import { generatePDF } from "@/utils/pdfGenerator";

interface Result {
  id: number;
  service: string;
  category: string;
  status: string;
  data: any;
  response: any;
  error?: string;
  timestamp: Date;
}

interface ResultsManagerProps {
  results: Result[];
  setResults: (results: Result[]) => void;
}

const ResultsManager: React.FC<ResultsManagerProps> = ({ results, setResults }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedResults, setSelectedResults] = useState<number[]>([]);

  const categories = [...new Set(results.map(r => r.category))];
  const statuses = [...new Set(results.map(r => r.status))];

  const filteredResults = results.filter(result => {
    const matchesSearch = result.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         result.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || result.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const downloadResults = (format: 'json' | 'pdf') => {
    const resultsToDownload = selectedResults.length > 0 
      ? results.filter(r => selectedResults.includes(r.id))
      : filteredResults;

    if (resultsToDownload.length === 0) {
      toast.error('No results to download');
      return;
    }

    const timestamp = new Date().toISOString().split('T')[0];

    if (format === 'json') {
      const jsonData = JSON.stringify(resultsToDownload, null, 2);
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `eko_shield_results_${timestamp}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Downloaded ${resultsToDownload.length} results as JSON`);
    } else {
      generatePDF(resultsToDownload, `eko_shield_results_${timestamp}.pdf`);
      toast.success(`Downloaded ${resultsToDownload.length} results as PDF`);
    }
  };

  const clearAllResults = () => {
    setResults([]);
    setSelectedResults([]);
    toast.success('All results cleared');
  };

  const deleteSelectedResults = () => {
    const remainingResults = results.filter(r => !selectedResults.includes(r.id));
    setResults(remainingResults);
    setSelectedResults([]);
    toast.success(`Deleted ${selectedResults.length} result(s)`);
  };

  const toggleResultSelection = (resultId: number) => {
    setSelectedResults(prev => 
      prev.includes(resultId) 
        ? prev.filter(id => id !== resultId)
        : [...prev, resultId]
    );
  };

  const selectAllResults = () => {
    if (selectedResults.length === filteredResults.length) {
      setSelectedResults([]);
    } else {
      setSelectedResults(filteredResults.map(r => r.id));
    }
  };

  // Helper function to safely convert any value to string
  const safeToString = (value: any): string => {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      try {
            // 2-space indentation makes key-value pairs line-by-line
            return JSON.stringify(value, null, 2);
      } catch {
        return '[Object]';
      }
    }
    return String(value);
  };

  // Helper function to safely get response data
  const getResponseData = (result: Result) => {
    if (result.status === 'FAILED' || !result.response) {
      return {
        verified: 'N/A',
        confidence: 'N/A',
        details: result.error || 'API call failed'
      };
    }
    
    return {
      verified: result.response.verified !== undefined ? (result.response.verified ? 'Yes' : 'No') : 'N/A',
      confidence: result.response.confidence !== undefined ? `${result.response.confidence}%` : 'N/A',
      details: safeToString(result.response.details || result.response.message || 'No details available')
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-slate-900">Verification Results</h3>
        <div className="flex items-center space-x-3">
          <Badge variant="outline" className="text-sm">
            {filteredResults.length} of {results.length} results
          </Badge>
          {selectedResults.length > 0 && (
            <Badge className="bg-blue-100 text-blue-800">
              {selectedResults.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search results..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            onClick={selectAllResults}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>{selectedResults.length === filteredResults.length ? 'Deselect All' : 'Select All'}</span>
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => downloadResults('json')}
            variant="outline"
            size="sm"
            disabled={filteredResults.length === 0}
          >
            <Code className="h-4 w-4 mr-2" />
            Download JSON
          </Button>
          
          <Button
            onClick={() => downloadResults('pdf')}
            variant="outline"
            size="sm"
            disabled={filteredResults.length === 0}
          >
            <FileText className="h-4 w-4 mr-2" />
            Download PDF
          </Button>

          {selectedResults.length > 0 && (
            <Button
              onClick={deleteSelectedResults}
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </Button>
          )}

          <Button
            onClick={clearAllResults}
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </Card>

      {/* Results List */}
      <div className="space-y-4">
        {filteredResults.length === 0 ? (
          <Card className="p-8 text-center">
            <Eye className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-slate-700 mb-2">No Results Found</h4>
            <p className="text-slate-500">
              {results.length === 0 
                ? 'No verification results yet. Start by selecting and configuring a verification service.'
                : 'No results match your current filters. Try adjusting your search criteria.'
              }
            </p>
          </Card>
        ) : (
          filteredResults.map((result) => {
            const responseData = getResponseData(result);
            
            return (
              <Card key={result.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedResults.includes(result.id)}
                      onChange={() => toggleResultSelection(result.id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                    />
                    
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium text-slate-900">{result.service}</h4>
                        <Badge variant="outline">{result.category}</Badge>
                        <Badge 
                          className={
                            result.status === 'SUCCESS' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-red-100 text-red-800 border-red-200'
                          }
                        >
                          {result.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600 mb-1"><strong>Input Data:</strong></p>
                          <div className="bg-slate-50 p-2 rounded text-xs">
                            {Object.entries(result.data || {}).map(([key, value]) => (
                              <div key={key}>{key}: {safeToString(value)}</div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-slate-600 mb-1"><strong>Response:</strong></p>
                          <div className="bg-slate-50 p-2 rounded text-xs">
                            <div>Verified: {responseData.verified}</div>
                            <div>Confidence: {responseData.confidence}</div>
                            <div>Details: {responseData.details}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-slate-500">
                    {result.timestamp.toLocaleString()}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ResultsManager;
