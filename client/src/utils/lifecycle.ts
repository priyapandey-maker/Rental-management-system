export type MilestoneStatus = 'completed' | 'current' | 'pending';

export interface LifecycleMilestone {
  id: string;
  label: string;
  desc: string;
  status: MilestoneStatus;
}

const MILESTONES = [
  { id: 'BOOKED', label: 'Booked', desc: 'Request initiated' },
  { id: 'CONFIRMED', label: 'Confirmed', desc: 'Contract approved' },
  { id: 'ALLOCATED', label: 'Allocated', desc: 'Serials assigned' },
  { id: 'FULFILLED', label: 'Fulfilled', desc: 'Out with customer' },
  { id: 'RETURNED', label: 'Returned', desc: 'Intake & Inspect' },
  { id: 'INSPECTED', label: 'Inspected', desc: 'Audit completed' },
  { id: 'RESOLVED', label: 'Resolved', desc: 'Settle charges' },
  { id: 'COMPLETED', label: 'Completed', desc: 'Closed lease' },
];

export function getLifecycleProgress(currentStatus: string): LifecycleMilestone[] {
  let currentMilestoneId = '';
  
  switch (currentStatus) {
    case 'DRAFT': 
      currentMilestoneId = 'BOOKED'; 
      break;
    case 'CONFIRMED': 
      currentMilestoneId = 'CONFIRMED'; 
      break;
    case 'ALLOCATED': 
      currentMilestoneId = 'ALLOCATED'; 
      break;
    case 'FULFILLED': 
      currentMilestoneId = 'FULFILLED'; 
      break;
    case 'RETURN_REQUESTED': 
    case 'RETURN_APPROVED': 
    case 'RETURN_RECEIVED': 
      currentMilestoneId = 'RETURNED'; 
      break;
    case 'INSPECTED': 
      currentMilestoneId = 'INSPECTED'; 
      break;
    case 'RESOLVED': 
      currentMilestoneId = 'RESOLVED'; 
      break;
    case 'COMPLETED': 
      currentMilestoneId = 'COMPLETED'; 
      break;
    default:
      currentMilestoneId = 'BOOKED';
  }

  const currentMilestoneIndex = MILESTONES.findIndex(m => m.id === currentMilestoneId);

  return MILESTONES.map((milestone, index) => {
    let status: MilestoneStatus = 'pending';
    
    if (index < currentMilestoneIndex) {
      status = 'completed';
    } else if (index === currentMilestoneIndex) {
      status = 'current';
    }
    
    if (currentStatus === 'COMPLETED') {
      status = 'completed';
    }

    return {
      ...milestone,
      status
    };
  });
}
