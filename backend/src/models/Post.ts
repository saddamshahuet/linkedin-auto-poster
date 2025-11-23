import mongoose, { Schema, Document } from 'mongoose';

export interface IPost extends Document {
  organizationId: string;
  linkedinAccountId: string;
  status: 'draft' | 'scheduled' | 'published' | 'failed';
  content: {
    text: string;
    hashtags: string[];
    mentions: string[];
    mediaUrls: string[];
  };
  generatedBy: {
    method: 'ai' | 'manual' | 'template';
    modelName?: string;
    prompt?: string;
    templateId?: string;
  };
  scheduling: {
    scheduledFor?: Date;
    publishedAt?: Date;
    timezone: string;
  };
  linkedinData?: {
    postId?: string;
    postUrl?: string;
    screenshotUrl?: string;
  };
  metrics?: {
    impressions: number;
    engagements: number;
    likes: number;
    comments: number;
    shares: number;
    clicks: number;
    lastUpdated?: Date;
  };
  createdBy: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PostSchema = new Schema<IPost>(
  {
    organizationId: { type: String, required: true, index: true },
    linkedinAccountId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'published', 'failed'],
      default: 'draft',
      index: true,
    },
    content: {
      text: { type: String, required: true },
      hashtags: [String],
      mentions: [String],
      mediaUrls: [String],
    },
    generatedBy: {
      method: { type: String, enum: ['ai', 'manual', 'template'], required: true },
      modelName: String,
      prompt: String,
      templateId: String,
    },
    scheduling: {
      scheduledFor: { type: Date, index: true },
      publishedAt: Date,
      timezone: { type: String, default: 'UTC' },
    },
    linkedinData: {
      postId: String,
      postUrl: String,
      screenshotUrl: String,
    },
    metrics: {
      impressions: { type: Number, default: 0 },
      engagements: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      clicks: { type: Number, default: 0 },
      lastUpdated: Date,
    },
    createdBy: { type: String, required: true },
    updatedBy: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
PostSchema.index({ organizationId: 1, status: 1 });
PostSchema.index({ linkedinAccountId: 1, 'scheduling.publishedAt': -1 });
PostSchema.index({ 'scheduling.scheduledFor': 1, status: 1 });

export const Post = mongoose.model<IPost>('Post', PostSchema);
