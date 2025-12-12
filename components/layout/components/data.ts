export const notifications = [
  {
    id: 1,
    title: "New Login from Chrome",
    role: "Administrator",
    desc: "New login activvity from the chrome browser.",
    avatar: "01.png",
    status: "online",
    unread_message: false,
    type: "text",
    date: "1 minute ago"
  },
];

export type Notification = (typeof notifications)[number];
