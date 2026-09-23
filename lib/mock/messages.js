// Quick-access message threads shown from the topbar — buyer/tenant conversations tied to a
// real lead where one exists, so clicking through feels connected to the Leads module rather
// than an isolated inbox. Avatar initials are derived from `name` (see components/ui/Avatar.jsx)
// rather than stored here, so there's one less field that could drift out of sync.
export const MOCK_MESSAGES = [
  {
    id: "m1",
    leadId: "LED-30002",
    name: "Karan Malhotra",
    lastMessage: "Can I schedule a site visit this weekend? Saturday afternoon works best.",
    time: "12 min ago",
    read: false,
  },
  {
    id: "m2",
    leadId: "LED-30007",
    name: "Divya Nair",
    lastMessage: "What's the final negotiable price on the Sarjapur villa?",
    time: "48 min ago",
    read: false,
  },
  {
    id: "m3",
    leadId: "LED-30012",
    name: "Vivek Rao",
    lastMessage: "Ready to sign this week if the unit checks out.",
    time: "2 hr ago",
    read: true,
  },
  {
    id: "m4",
    leadId: "LED-30010",
    name: "Farhan Sheikh",
    lastMessage: "Any single-sharing rooms available near Hitech City?",
    time: "5 hr ago",
    read: true,
  },
];
