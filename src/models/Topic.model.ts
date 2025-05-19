import mongoose, { Schema, Document } from 'mongoose';

export interface Feedback extends Document {
  rating: number;
  text: string;
  createdAt: Date;
}

const FeedbackSchema: Schema<Feedback> = new Schema({
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

export interface Topic extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  feedback: Feedback[];
  createdAt: Date;
}

const TopicSchema: Schema<Topic> = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    required: [true, 'Please provide a topic name'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  feedback: [FeedbackSchema],
  createdAt: {
    type: Date,
    default: Date.now,
    required: true,
  },
});

const TopicModel = (mongoose.models.Topic as mongoose.Model<Topic>) || mongoose.model<Topic>('Topic', TopicSchema);

export default TopicModel;