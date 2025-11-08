# ShadowChat - Design Guidelines

## Design Approach
**Reference-Based + Custom Dark Aesthetic**: Drawing inspiration from Signal, Telegram, and Discord for messaging patterns, combined with a custom "stealthy" dark aesthetic as specified. This is a utility-focused messaging app with a distinctive visual identity emphasizing minimalism and subtlety.

## Typography System

**Primary Font**: Inter or DM Sans (via Google Fonts CDN)
**Secondary Font**: JetBrains Mono (for user IDs and codes)

**Hierarchy**:
- App Title/Branding: 24px, semi-bold
- Section Headers: 18px, medium
- Message Sender Names: 14px, medium
- Message Text: 15px, regular
- Timestamps/Meta: 12px, regular
- User IDs: 13px, mono, medium

## Layout & Spacing System

**Tailwind Spacing Units**: Consistently use 2, 4, 6, and 8
- Micro spacing (gaps, padding): p-2, gap-2
- Standard component padding: p-4
- Section spacing: p-6, py-8
- Major layout divisions: p-8

**Core Layout Structure**:
```
[Sidebar: 280px] [Main Chat Area: flex-1] [Optional Right Panel: 320px]
```

Mobile breakpoint: Stack sidebar as slide-out drawer, full-width chat area

## Component Library

### Authentication Screens
- Centered card layout (max-w-md)
- Logo/brand at top with glow effect
- Form fields with consistent p-4 spacing
- Invite code input with monospace font
- Error states with subtle border treatments
- "Sign Up" / "Log In" toggle

### Sidebar Navigation
- Fixed width 280px on desktop
- User profile section at top (p-4)
- Search bar (h-10, rounded-lg)
- Chat list with infinite scroll
- Each chat item: h-16, p-3, flex layout
- Avatar (40x40), name, last message preview, timestamp
- Unread badge (absolute positioned, top-right)
- Active chat highlight treatment

### Main Chat Interface
**Header Bar** (h-16):
- User/Group name + status indicator
- Right-aligned actions (call, info, menu icons)
- Border bottom separator

**Message Area**:
- Flex column, reverse scroll (newest at bottom)
- Message bubbles with max-w-lg
- Own messages: ml-auto (right-aligned)
- Other messages: mr-auto (left-aligned)
- Padding between messages: gap-2
- Timestamp positioning: text-xs, mt-1

**Message Bubble Design**:
- Rounded-2xl corners
- Padding: px-4 py-3
- Avatar (32x32) for group chats only
- Seen indicators: small icons bottom-right
- File/image attachments: rounded-lg, max-w-sm

**Input Area** (h-20):
- Fixed bottom position
- Flex row layout: [Attach Button] [Input Field: flex-1] [Send Button]
- Input field: h-12, rounded-full, px-6
- Icon buttons: w-10 h-10, rounded-full

### Group Chat Creation
- Modal overlay (backdrop blur)
- Card: max-w-lg, p-6
- Group image upload (120x120 circular preview)
- Group name input
- Member search/add interface
- Invite code generation display (monospace font)

### User Search Modal
- Search input with live filtering
- User results list: gap-2
- Each result: h-14, flex items-center, px-4
- User ID display (monospace) + username
- "Start Chat" action button

### File/Image Sharing
- Image previews: rounded-lg, max dimensions 400px
- File attachments: pill-shaped container
- File name, size, download icon
- Upload progress indicators (linear progress bar)

## Responsive Behavior

**Desktop (lg:)**: Full three-column layout when needed
**Tablet (md:)**: Sidebar + Chat area, right panel as modal
**Mobile (base)**: 
- Sidebar as slide-out drawer (translate-x transform)
- Full-width chat interface
- Header with back button to return to chat list
- Bottom navigation for key actions

## Interaction Patterns

**Message Sending**: 
- Smooth fade-in animation (150ms)
- Optimistic UI update (instant display)
- Sending indicator during network request

**Online Status**:
- Small dot indicator (8px) on avatars
- Position: absolute bottom-0 right-0

**Typing Indicators**:
- Below last message in chat
- Animated ellipsis (3 dots pulsing)

**Transitions**: 
- Use sparingly: transform, opacity only
- Duration: 150-200ms for UI changes
- Easing: ease-out for most transitions

## Navigation Structure

**Main Navigation** (Sidebar):
1. All Chats (default view)
2. Groups
3. Settings
4. Profile

**Chat Context Menu** (right-click/long-press):
- Mute notifications
- Archive chat
- Delete conversation
- Block user (for 1:1)

## Icons
Use Heroicons (outline for most, solid for active states) via CDN

**Essential Icons**:
- Search, Add User, Create Group
- Send, Attach, Image, File
- Menu (hamburger), More (vertical dots)
- Check marks (seen/delivered)
- Lock/Shield (for security indicators)

## Accessibility
- Maintain WCAG AA contrast standards despite dark theme
- Focus indicators on all interactive elements
- Keyboard navigation throughout
- ARIA labels for icon-only buttons
- Screen reader announcements for new messages

## Images
No hero images needed - this is a messaging application. However:
- User avatars: circular, 32-40px in lists, 120px in profiles
- Group images: circular, same sizing as user avatars
- Shared images: display inline with rounded corners
- Default avatars: generated from initials with distinct treatments

This design creates a focused, efficient messaging experience with a distinctive dark aesthetic that feels modern, secure, and "under the radar" as requested.