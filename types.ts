
export enum SocialPlatform {
  YOUTUBE = 'YouTube',
  INSTAGRAM = 'Instagram',
  TIKTOK = 'TikTok',
  LINKEDIN = 'LinkedIn',
  BLOG = 'Blog/Website'
}

export interface InfluencerProfile {
  senderName: string; // Your name for the signature
  name: string;
  email?: string; // Added email address
  platform: SocialPlatform;
  handle: string; // @username or channel link
  description: string; // User's observations in Chinese or English
  brandInfo: string; // Brand name OR description (optional)
}

export interface GeneratedEmail {
  subject: string;
  body: string;
  sources?: Array<{ title: string; uri: string }>; // Added sources for grounding
}

export interface BatchResult {
  id: string;
  profile: InfluencerProfile;
  generatedEmail: GeneratedEmail | null;
  followUpEmail?: GeneratedEmail | null; // New field for follow-up email
  status: 'pending' | 'success' | 'error';
  error?: string;
  isSent?: boolean; // New field to track if the user has actioned this email
  scheduledDate?: Date | null; // Track scheduled time
}
