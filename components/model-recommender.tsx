/**
 * @file model-recommender.tsx
 * @author Tom Butler
 * @date 2025-10-23
 * @description AI model recommendation engine suggesting optimal models for tasks.
 */

"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Brain, MessageSquare, Image, Music, ArrowRight } from 'lucide-react';
import type { ModelCardProps } from './model-card';

interface ModelRecommenderProps {
  models: ModelCardProps[];
  onModelSelect: (modelId: string) => void;
}

interface Question {
  id: string;
  text: string;
  options: {
    id: string;
    text: string;
    categories: string[];
    weights: Record<string, number>;
  }[];
}

const questions: Question[] = [
  {
    id: 'task',
    text: 'What type of task do you need to accomplish?',
    options: [
      {
        id: 'conversation',
        text: 'Natural conversation and text generation',
        categories: ['language'],
        weights: { 'gpt-4': 1, 'claude-3': 0.9, 'llama-3': 0.8 }
      },
      {
        id: 'image',
        text: 'Image generation and editing',
        categories: ['vision'],
        weights: { 'dall-e-3': 1, 'midjourney-v6': 0.9 }
      },
      {
        id: 'audio',
        text: 'Speech recognition and transcription',
        categories: ['audio'],
        weights: { 'whisper-v3': 1 }
      }
    ]
  },
  {
    id: 'priority',
    text: 'What is your top priority?',
    options: [
      {
        id: 'accuracy',
        text: 'Highest accuracy and quality',
        categories: ['all'],
        weights: { 'gpt-4': 1, 'claude-3': 0.95, 'dall-e-3': 0.9 }
      },
      {
        id: 'speed',
        text: 'Fast response times',
        categories: ['all'],
        weights: { 'llama-3': 1, 'whisper-v3': 0.9 }
      },
      {
        id: 'cost',
        text: 'Lower cost per operation',
        categories: ['all'],
        weights: { 'llama-3': 1, 'whisper-v3': 0.8 }
      }
    ]
  },
  {
    id: 'scale',
    text: 'What scale are you operating at?',
    options: [
      {
        id: 'small',
        text: 'Small scale / Testing',
        categories: ['all'],
        weights: { 'gpt-4': 0.8, 'dall-e-3': 0.8, 'whisper-v3': 0.9 }
      },
      {
        id: 'medium',
        text: 'Medium scale / Production',
        categories: ['all'],
        weights: { 'claude-3': 1, 'midjourney-v6': 0.9 }
      },
      {
        id: 'large',
        text: 'Large scale / Enterprise',
        categories: ['all'],
        weights: { 'llama-3': 1, 'claude-3': 0.9 }
      }
    ]
  }
];

/**
 * @constructor
 */
export function ModelRecommender({ models, onModelSelect }: ModelRecommenderProps) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [recommendation, setRecommendation] = useState<ModelCardProps | null>(null);

  const handleAnswer = (questionId: string, answerId: string) => {
    const newAnswers = { ...answers, [questionId]: answerId };
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      // Calculate recommendations
      const scores = models.reduce((acc, model) => {
        acc[model.id] = 0;
        return acc;
      }, {} as Record<string, number>);

      // Calculate scores based on answers
      Object.entries(newAnswers).forEach(([questionId, answerId]) => {
        const question = questions.find(q => q.id === questionId);
        const answer = question?.options.find(o => o.id === answerId);
        
        if (answer) {
          Object.entries(answer.weights).forEach(([modelId, weight]) => {
            scores[modelId] = (scores[modelId] || 0) + weight;
          });
        }
      });

      // Find the model with the highest score
      const bestModelId = Object.entries(scores).reduce((a, b) => 
        b[1] > a[1] ? b : a
      )[0];

      setRecommendation(models.find(m => m.id === bestModelId) || null);
    }
  };

  const resetRecommendation = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setRecommendation(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      {!recommendation ? (
        <div className="space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2">
              Find Your Perfect AI Model
            </h2>
            <p className="text-foreground/70">
              Answer a few questions to get a personalised recommendation
            </p>
          </div>

          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <h3 className="text-xl font-semibold">
              {questions[currentQuestion].text}
            </h3>

            <div className="space-y-4">
              {questions[currentQuestion].options.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAnswer(questions[currentQuestion].id, option.id)}
                  className="w-full p-4 rounded-lg border border-border bg-card hover:border-matrix-primary/50 text-left transition-colors"
                >
                  <p className="font-medium">{option.text}</p>
                </motion.button>
              ))}
            </div>

            <div className="flex justify-between text-sm text-foreground/50">
              <span>Question {currentQuestion + 1} of {questions.length}</span>
              <button
                onClick={resetRecommendation}
                className="text-matrix-primary hover:text-matrix-secondary"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-8 rounded-lg border border-matrix-primary/20 bg-card"
        >
          <div className="text-center mb-8">
            <div className="inline-block p-3 rounded-full bg-matrix-primary/10 mb-4">
              <recommendation.icon className="w-8 h-8 text-matrix-primary" />
            </div>
            <h2 className="text-2xl font-bold mb-2">
              Recommended Model
            </h2>
            <p className="text-foreground/70">
              Based on your requirements
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold mb-1">{recommendation.title}</h3>
              <p className="text-matrix-primary">{recommendation.provider}</p>
            </div>

            <p className="text-foreground/70">
              {recommendation.description}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-foreground/50 mb-1">Accuracy</p>
                <p className="font-semibold">{recommendation.metrics.accuracy}%</p>
              </div>
              <div>
                <p className="text-sm text-foreground/50 mb-1">Latency</p>
                <p className="font-semibold">{recommendation.metrics.latency}ms</p>
              </div>
              <div>
                <p className="text-sm text-foreground/50 mb-1">Cost per 1K</p>
                <p className="font-semibold">${recommendation.metrics.costper1k}</p>
              </div>
              <div>
                <p className="text-sm text-foreground/50 mb-1">Daily Quota</p>
                <p className="font-semibold">{recommendation.metrics.dailyQuota.toLocaleString()}</p>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                onClick={() => onModelSelect(recommendation.id)}
                className="flex-1 py-2 rounded-lg bg-matrix-primary text-background font-medium hover:bg-matrix-primary/90 transition-colors flex items-center justify-center gap-2"
              >
                Select Model
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={resetRecommendation}
                className="flex-1 py-2 rounded-lg border border-matrix-primary text-matrix-primary font-medium hover:bg-matrix-primary/10 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}