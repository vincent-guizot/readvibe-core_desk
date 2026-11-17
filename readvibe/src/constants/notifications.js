/**
 * Notification Items & Types
 */

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Reading Milestone reached!',
    message: 'You have finished 12 books in 2026! 60% of your annual goal.',
    time: '2 hours ago',
    read: false,
    link: '/stats'
  },
  {
    id: 'notif-2',
    title: 'New Vibe Match for you',
    message: 'Based on your cozy evening reading vibe: "Before the Coffee Gets Cold".',
    time: '1 day ago',
    read: false,
    link: '/books/coffee-cold'
  },
  {
    id: 'notif-3',
    title: 'Maya liked your Vibe Card',
    message: 'Your Vibe Card for "The Midnight Library" was saved to @maya_reads collection.',
    time: '3 days ago',
    read: true,
    link: '/profile'
  }
];
