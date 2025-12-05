/**
 * Color utility mapping for consistent status and priority colors across the app
 * Used for badges and status indicators in test cases, projects, etc.
 */

/**
 * Get color classes for status values (test cases, projects, etc.)
 * @param status - Status value like 'pass', 'fail', 'active', 'completed', etc.
 * @returns Tailwind color classes as string
 */
export function getStatusColor(status: string): string {
  const lowerStatus = status.toLowerCase();

  // Test case statuses
  if (lowerStatus === 'pass') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (lowerStatus === 'fail') {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (lowerStatus === 'new') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  // Project statuses
  if (lowerStatus === 'active') {
    return 'bg-green-100 text-green-800 border-green-200';
  }
  if (lowerStatus === 'completed') {
    return 'bg-blue-100 text-blue-800 border-blue-200';
  }
  if (lowerStatus === 'paused') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }

  // Default fallback
  return 'bg-gray-100 text-gray-800 border-gray-200';
}

/**
 * Get color classes for priority values
 * @param priority - Priority level like 'high', 'medium', 'low', 'critical'
 * @returns Tailwind color classes as string
 */
export function getPriorityColor(priority: string): string {
  const lowerPriority = priority.toLowerCase();

  if (lowerPriority === 'critical') {
    return 'bg-red-100 text-red-800 border-red-200';
  }
  if (lowerPriority === 'high') {
    return 'bg-orange-100 text-orange-800 border-orange-200';
  }
  if (lowerPriority === 'medium') {
    return 'bg-yellow-100 text-yellow-800 border-yellow-200';
  }
  if (lowerPriority === 'low') {
    return 'bg-green-100 text-green-800 border-green-200';
  }

  // Default fallback
  return 'bg-gray-100 text-gray-800 border-gray-200';
}
