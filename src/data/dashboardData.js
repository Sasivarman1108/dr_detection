export const navSections = [
  {
    label: 'Main Menu',
    items: [
      { id: 'severity-queue', label: 'Severity Queue', icon: 'SQ', badge: '7', active: true },
      { id: 'upload-scan', label: 'Upload Scan', icon: 'US' },
      { id: 'analytics', label: 'Analytics', icon: 'AN', badge: 'New', badgeVariant: 'info' },
    ],
  },
  {
    label: 'Records',
    items: [
      { id: 'patients', label: 'Patients', icon: 'PT' },
      { id: 'staff', label: 'Staff', icon: 'SF' },
      { id: 'settings', label: 'Settings', icon: 'ST' },
    ],
  },
];

export const stats = [
  { id: 'no-dr', label: 'No DR', tone: 'nodr', icon: 'ND', stageTone: 'nodr', stageLabel: 'No DR' },
  { id: 'mild', label: 'Mild NPDR', tone: 'mild', icon: 'MI', stageTone: 'mild', stageLabel: 'Mild NPDR' },
  { id: 'moderate', label: 'Moderate NPDR', tone: 'moderate', icon: 'MO', stageTone: 'moderate', stageLabel: 'Moderate' },
  { id: 'severe', label: 'Severe NPDR', tone: 'severe', icon: 'SV', stageTone: 'severe', stageLabel: 'Severe NPDR' },
  { id: 'pdr', label: 'PDR | Urgent', tone: 'pdr', icon: 'PD', stageTone: 'pdr', stageLabel: 'PDR' },
];

export const queueFilters = ['Pending', 'Under Review', 'Urgent', 'All'];
