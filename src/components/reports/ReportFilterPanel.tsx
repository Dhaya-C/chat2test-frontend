"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/Input';
import { ReportFilter, FilterOptions } from '@/types/reports';
import { ChevronDown, X } from 'lucide-react';

interface ReportFilterPanelProps {
  filterOptions: FilterOptions | null;
  filteredSessions: FilterOptions['sessions'];
  currentFilters: ReportFilter;
  onApplyFilters: (filters: ReportFilter) => Promise<void>;
  onResetFilters: () => void;
  loading?: boolean;
  filterLoading?: boolean;
  onProjectsChange?: (projectIds: number[] | null) => void;
}

export function ReportFilterPanel({
  filterOptions,
  filteredSessions,
  currentFilters,
  onApplyFilters,
  onResetFilters,
  loading = false,
  filterLoading = false,
  onProjectsChange,
}: ReportFilterPanelProps) {
  const [localFilters, setLocalFilters] = useState(currentFilters);
  const [isApplying, setIsApplying] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    setLocalFilters(currentFilters);
  }, [currentFilters]);

  // Handle project selection
  const handleProjectToggle = useCallback((projectId: number) => {
    setLocalFilters(prev => {
      const newProjectIds = prev.project_ids?.includes(projectId)
        ? prev.project_ids.filter(id => id !== projectId)
        : [...(prev.project_ids || []), projectId];

      const finalProjectIds = newProjectIds.length > 0 ? newProjectIds : null;
      
      // Notify parent about project selection change for session filtering
      onProjectsChange?.(finalProjectIds);

      return {
        ...prev,
        project_ids: finalProjectIds,
        session_ids: null, // Reset sessions when projects change
      };
    });
  }, [onProjectsChange]);

  // Handle session selection
  const handleSessionToggle = useCallback((sessionId: string) => {
    setLocalFilters(prev => {
      const newSessionIds = prev.session_ids?.includes(sessionId)
        ? prev.session_ids.filter(id => id !== sessionId)
        : [...(prev.session_ids || []), sessionId];

      return {
        ...prev,
        session_ids: newSessionIds.length > 0 ? newSessionIds : null,
      };
    });
  }, []);

  // Handle status selection
  const handleStatusToggle = useCallback((status: string) => {
    setLocalFilters(prev => {
      const newStatuses = prev.test_case_status?.includes(status)
        ? prev.test_case_status.filter(s => s !== status)
        : [...(prev.test_case_status || []), status];

      return {
        ...prev,
        test_case_status: newStatuses.length > 0 ? newStatuses : null,
      };
    });
  }, []);

  // Handle priority selection
  const handlePriorityToggle = useCallback((priority: string) => {
    setLocalFilters(prev => {
      const newPriorities = prev.priority?.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...(prev.priority || []), priority];

      return {
        ...prev,
        priority: newPriorities.length > 0 ? newPriorities : null,
      };
    });
  }, []);

  // Handle module selection
  const handleModuleToggle = useCallback((module: string) => {
    setLocalFilters(prev => {
      const newModules = prev.modules?.includes(module)
        ? prev.modules.filter(m => m !== module)
        : [...(prev.modules || []), module];

      return {
        ...prev,
        modules: newModules.length > 0 ? newModules : null,
      };
    });
  }, []);

  // Handle date changes - convert from input (YYYY-MM-DD) to ISO 8601
  const handleDateFromChange = useCallback((value: string) => {
    // Convert YYYY-MM-DD to ISO 8601 with start of day
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    const isoString = date.toISOString();
    
    setLocalFilters(prev => ({
      ...prev,
      date_from: isoString,
    }));
  }, []);

  const handleDateToChange = useCallback((value: string) => {
    // Convert YYYY-MM-DD to ISO 8601 with end of day
    const date = new Date(value);
    date.setHours(23, 59, 59, 999);
    const isoString = date.toISOString();
    
    setLocalFilters(prev => ({
      ...prev,
      date_to: isoString,
    }));
  }, []);

  // Apply filters
  const handleApply = async () => {
    setIsApplying(true);
    try {
      // Pass the local filters directly to the parent
      await onApplyFilters(localFilters);
      setOpenDropdown(null);
    } finally {
      setIsApplying(false);
    }
  };

  // Reset filters
  const handleReset = () => {
    onResetFilters();
    setOpenDropdown(null);
  };

  // Get selected labels
  const getSelectedLabel = (type: string) => {
    switch (type) {
      case 'projects':
        return localFilters.project_ids?.length
          ? `${localFilters.project_ids.length} selected`
          : 'Select Projects';
      case 'sessions':
        return localFilters.session_ids?.length
          ? `${localFilters.session_ids.length} selected`
          : 'Select Sessions';
      case 'status':
        return localFilters.test_case_status?.length
          ? `${localFilters.test_case_status.length} selected`
          : 'Select Status';
      case 'priority':
        return localFilters.priority?.length
          ? `${localFilters.priority.length} selected`
          : 'Select Priority';
      case 'modules':
        return localFilters.modules?.length
          ? `${localFilters.modules.length} selected`
          : 'Select Modules';
      default:
        return '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Filters</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Projects Dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold mb-2 text-foreground">Projects</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'projects' ? null : 'projects')}
              disabled={filterLoading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm flex items-center justify-between hover:bg-accent disabled:opacity-50"
            >
              <span className="truncate">{getSelectedLabel('projects')}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>

            {/* Projects Dropdown Menu */}
            {openDropdown === 'projects' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {filterOptions?.projects?.length ? (
                  filterOptions.projects.map(project => (
                    <label
                      key={project.project_id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.project_ids?.includes(project.project_id) ?? false}
                        onChange={() => handleProjectToggle(project.project_id)}
                        className="rounded"
                      />
                      <span className="text-sm text-foreground">{project.project_name}</span>
                    </label>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No projects available</div>
                )}
              </div>
            )}
          </div>

          {/* Sessions Dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold mb-2 text-foreground">Sessions</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'sessions' ? null : 'sessions')}
              disabled={filterLoading || !localFilters.project_ids?.length}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm flex items-center justify-between hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="truncate">{getSelectedLabel('sessions')}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>

            {/* Sessions Dropdown Menu */}
            {openDropdown === 'sessions' && localFilters.project_ids?.length ? (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {filteredSessions?.length ? (
                  filteredSessions.map(session => (
                    <label
                      key={session.session_id}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.session_ids?.includes(session.session_id) ?? false}
                        onChange={() => handleSessionToggle(session.session_id)}
                        className="rounded"
                      />
                      <span className="text-sm text-foreground truncate">{session.session_name}</span>
                    </label>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No sessions available</div>
                )}
              </div>
            ) : null}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold mb-2 text-foreground">Status</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'status' ? null : 'status')}
              disabled={filterLoading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm flex items-center justify-between hover:bg-accent disabled:opacity-50"
            >
              <span className="truncate">{getSelectedLabel('status')}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>

            {/* Status Dropdown Menu */}
            {openDropdown === 'status' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {filterOptions?.statuses?.length ? (
                  filterOptions.statuses.map(status => (
                    <label
                      key={status}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.test_case_status?.includes(status) ?? false}
                        onChange={() => handleStatusToggle(status)}
                        className="rounded"
                      />
                      <span className="text-sm text-foreground">{status}</span>
                    </label>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No statuses available</div>
                )}
              </div>
            )}
          </div>

          {/* Priority Dropdown */}
          <div className="relative">
            <label className="block text-xs font-semibold mb-2 text-foreground">Priority</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'priority' ? null : 'priority')}
              disabled={filterLoading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm flex items-center justify-between hover:bg-accent disabled:opacity-50"
            >
              <span className="truncate">{getSelectedLabel('priority')}</span>
              <ChevronDown className="h-4 w-4 flex-shrink-0" />
            </button>

            {/* Priority Dropdown Menu */}
            {openDropdown === 'priority' && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-input rounded-md shadow-lg z-10 max-h-60 overflow-y-auto">
                {filterOptions?.priorities?.length ? (
                  filterOptions.priorities.map(priority => (
                    <label
                      key={priority}
                      className="flex items-center gap-2 px-3 py-2 hover:bg-accent cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={localFilters.priority?.includes(priority) ?? false}
                        onChange={() => handlePriorityToggle(priority)}
                        className="rounded"
                      />
                      <span className="text-sm text-foreground">{priority}</span>
                    </label>
                  ))
                ) : (
                  <div className="px-3 py-2 text-xs text-muted-foreground">No priorities available</div>
                )}
              </div>
            )}
          </div>

          {/* Modules Dropdown - Commented Out */}

          {/* Date Range - Commented Out */}
          {/* <div>
            <label className="block text-xs font-semibold mb-2 text-foreground">From Date</label>
            <Input
              type="date"
              value={localFilters.date_from ? localFilters.date_from.split('T')[0] : ''}
              onChange={(e) => handleDateFromChange(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-2 text-foreground">To Date</label>
            <Input
              type="date"
              value={localFilters.date_to ? localFilters.date_to.split('T')[0] : ''}
              onChange={(e) => handleDateToChange(e.target.value)}
              disabled={loading}
              className="w-full"
            />
          </div> */}
        </div>

        {/* Buttons */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleApply}
            disabled={loading || isApplying}
            className="flex-1"
          >
            {isApplying ? 'Applying...' : 'Apply Filters'}
          </Button>
          <Button
            onClick={handleReset}
            variant="outline"
            disabled={loading || isApplying}
            className="flex-1"
          >
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
