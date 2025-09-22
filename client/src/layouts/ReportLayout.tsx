import React, { useState, useEffect } from 'react';
import { useAppSelector } from '../store/hooks';
import { ReportData, InterviewResponse } from '../components/Report/types';
import { LoadingState, ErrorState } from '../components/Report/ReportStates';
import ReportHeader from '../components/Report/ReportHeader';
import OverallScore from '../components/Report/OverallScore';
import PerformanceChart from '../components/Report/PerformanceChart';
import SkillsAssessment from '../components/Report/SkillsAssessment';
import StrengthsCard from '../components/Report/StrengthsCard';
import WeaknessesCard from '../components/Report/WeaknessesCard';
import RecommendationsCard from '../components/Report/RecommendationsCard';
import DisclaimerCard from '../components/Report/DisclaimerCard';

const ReportLayout: React.FC = () => {
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get interview results from Redux store
  const interviewResults = useAppSelector((state) => state.interview.interviewResults);
  const role = useAppSelector((state) => state.interview.role);

  // Process interview results into report data
  const processInterviewResults = (results: InterviewResponse): ReportData => {
    const textAnalysis = results.analysis.text_analysis;
    const speechAnalysis = results.analysis.speech_analysis;
    
    // Calculate average text score
    const textScores = textAnalysis?.analysis?.map(q => q.aiAnalysis.overallScore) || [];
    const avgTextScore = textScores.length > 0 
      ? textScores.reduce((sum, score) => sum + score, 0) / textScores.length 
      : 0;

    // Calculate average speech score from successful analyses
    const successfulSpeechAnalyses = speechAnalysis?.analysis?.filter(a => !a.error) || [];
    const speechScores = successfulSpeechAnalyses
      .map(a => a.communication_analysis?.overall_score || 0)
      .filter(score => score > 0);
    const avgSpeechScore = speechScores.length > 0 
      ? speechScores.reduce((sum, score) => sum + score, 0) / speechScores.length 
      : 0;

    // Generate strengths and weaknesses based on analysis
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const recommendations: string[] = [];

    // Analyze text responses if available - MUCH STRICTER THRESHOLDS
    if (textAnalysis?.analysis) {
      textAnalysis.analysis.forEach(q => {
        if (q.aiAnalysis.overallScore >= 85) { // Raised from 70
          strengths.push(`Strong answer for ${q.category.toLowerCase()} question: "${q.question.substring(0, 60)}..."`);
        } else if (q.aiAnalysis.overallScore < 50) { // Raised from 30
          weaknesses.push(`Needs improvement in ${q.category.toLowerCase()}: ${q.aiAnalysis.overallSummary}`);
          recommendations.push(`Focus on providing more detailed answers for ${q.category.toLowerCase()} questions`);
        } else if (q.aiAnalysis.overallScore < 70) { // Added mid-range penalty
          weaknesses.push(`Mediocre performance in ${q.category.toLowerCase()} - needs more depth and technical detail`);
        }
      });
    }

    // Analyze speech if available - MUCH STRICTER THRESHOLDS
    if (speechScores.length > 0) {
      const avgConfidence = successfulSpeechAnalyses
        .map(a => a.communication_analysis?.confidence.score || 0)
        .reduce((sum, score) => sum + score, 0) / successfulSpeechAnalyses.length;
      
      if (avgConfidence >= 90) { // Raised from 80
        strengths.push("Demonstrates confident speaking and clear articulation");
      } else if (avgConfidence < 75) { // Raised from 60
        weaknesses.push("Could improve confidence in verbal communication");
        recommendations.push("Practice speaking with more confidence and clarity");
      } else if (avgConfidence < 85) { // Added mid-range penalty
        weaknesses.push("Moderate confidence but could be more assertive in delivery");
      }

      // Check hesitation patterns - MUCH STRICTER
      const avgHesitationRate = successfulSpeechAnalyses
        .map(a => a.communication_analysis?.hesitation.rate || 0)
        .reduce((sum, rate) => sum + rate, 0) / successfulSpeechAnalyses.length;
      
      if (avgHesitationRate > 3) { // Lowered from 10
        weaknesses.push("High hesitation rate indicates uncertainty in responses");
        recommendations.push("Practice answering questions more fluently to reduce hesitation");
      } else if (avgHesitationRate > 1.5) { // Added moderate penalty
        weaknesses.push("Noticeable hesitation patterns - practice speaking more fluently");
      } else if (avgHesitationRate < 1) { // Raised threshold for strength
        strengths.push("Shows fluent communication with minimal hesitation");
      }

      // Analyze tone patterns - STRICTER
      const neutralToneCount = successfulSpeechAnalyses
        .filter(a => a.communication_analysis?.tone.assessment?.includes('neutral')).length;
      
      if (neutralToneCount / successfulSpeechAnalyses.length > 0.5) { // Lowered from 0.7
        recommendations.push("Consider adding more enthusiasm and energy to responses");
        weaknesses.push("Tone lacks enthusiasm and professional energy");
      }
      
      // Add speech-specific strengths when text analysis is missing - STRICTER
      if (!textAnalysis?.analysis) {
        strengths.push(`Provided audio responses for ${successfulSpeechAnalyses.length} questions`);
        if (avgSpeechScore >= 80) { // Raised from 70
          strengths.push("Strong verbal communication skills demonstrated");
        } else if (avgSpeechScore < 60) {
          weaknesses.push("Verbal communication skills need significant improvement");
        }
      }
    }

    // Default strengths/weaknesses if none found - STRICTER EVALUATION
    if (strengths.length === 0) {
      if (speechScores.length > 0) {
        strengths.push("Participated actively in the voice portion of the interview");
      } else {
        strengths.push("Completed the interview process");
      }
      // Add a weakness if no genuine strengths were found
      weaknesses.push("Performance did not demonstrate clear strengths in key areas");
    }
    
    if (weaknesses.length === 0) {
      if (!textAnalysis?.analysis && speechScores.length === 0) {
        weaknesses.push("Unable to analyze responses - please ensure both text and audio responses are provided");
        weaknesses.push("Incomplete interview submission severely impacts evaluation");
      } else if (!textAnalysis?.analysis) {
        weaknesses.push("Text analysis unavailable - focus on providing written responses");
        weaknesses.push("Missing written responses significantly limits technical evaluation");
      } else {
        weaknesses.push("Needs to provide more comprehensive and detailed answers");
        weaknesses.push("Responses lack depth and technical sophistication");
      }
    }
    
    if (recommendations.length === 0) {
      if (!textAnalysis?.analysis && speechScores.length === 0) {
        recommendations.push("Ensure all interview questions are answered completely");
        recommendations.push("Provide both written and verbal responses when possible");
        recommendations.push("Focus on technical depth and professional communication");
      } else if (!textAnalysis?.analysis) {
        recommendations.push("Focus on providing detailed written responses to interview questions");
        recommendations.push("Develop stronger technical writing and explanation skills");
      } else {
        recommendations.push("Focus on providing more detailed and relevant responses to interview questions");
        recommendations.push("Improve technical depth and communication clarity");
      }
    }

    // Calculate overall scores with fallbacks - EXTREMELY STRICT EVALUATION
    const hasTextAnalysis = textAnalysis?.analysis && textScores.length > 0;
    const hasSpeechAnalysis = speechScores.length > 0;
    
    let overallScore: number;
    let technicalScore: number;
    let communicationScore: number;
    
    if (hasTextAnalysis && hasSpeechAnalysis) {
      // Both analyses available - apply strict penalty for imperfect performance
      let rawOverallScore = (avgTextScore + avgSpeechScore) / 2;
      overallScore = Math.round(rawOverallScore * 0.85); // 15% reduction for stricter evaluation
      technicalScore = Math.round(avgTextScore * 0.9); // 10% reduction
      communicationScore = Math.round(avgSpeechScore * 0.8); // 20% reduction for speech
    } else if (hasTextAnalysis) {
      // Only text analysis available - significant penalty for missing speech component
      overallScore = Math.round(avgTextScore * 0.7); // 30% penalty for incomplete interview
      technicalScore = Math.round(avgTextScore * 0.85); // 15% penalty
      communicationScore = Math.round(avgTextScore * 0.6); // Major penalty since no speech data
    } else if (hasSpeechAnalysis) {
      // Only speech analysis available - major penalty for missing technical assessment
      overallScore = Math.round(avgSpeechScore * 0.6); // 40% penalty for incomplete interview
      technicalScore = Math.round(avgSpeechScore * 0.5); // Major penalty since no technical text analysis
      communicationScore = Math.round(avgSpeechScore * 0.75); // 25% penalty
    } else {
      // No analysis available - very poor scores for incomplete submission
      overallScore = 25; // Much lower than previous 50
      technicalScore = 20;
      communicationScore = 30;
    }

    // Apply caps to prevent unrealistically high scores
    overallScore = Math.min(95, overallScore); // Cap at 95 instead of 100
    technicalScore = Math.min(95, technicalScore);
    communicationScore = Math.min(95, communicationScore);

    return {
      technicalKnowledge: technicalScore,
      communicationSkills: communicationScore,
      attitude: Math.min(90, Math.max(25, overallScore - 5)), // Reduced attitude boost and lower floor
      strengths,
      weaknesses,
      recommendations,
      role: role || 'Developer',
      overallScore,
      interviewResponse: results,
      textAnalysisScore: avgTextScore,
      speechAnalysisScore: avgSpeechScore || 0
    };
  };

  useEffect(() => {
    if (interviewResults) {
      try {
        const processedData = processInterviewResults(interviewResults);
        setReportData(processedData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error processing interview results:', err);
        setError('Failed to process interview results');
        setIsLoading(false);
      }
    } else {
      // No interview results found, show error after a delay
      const timer = setTimeout(() => {
        setError('No interview results found. Please complete an interview first.');
        setIsLoading(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [interviewResults, role]);

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || !reportData) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <ReportHeader reportData={reportData} />
        
        {/* Main Score Section */}
        <div className="mb-12">
          <OverallScore reportData={reportData} />
        </div>
        
        {/* Performance & Skills Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-12">
          <PerformanceChart reportData={reportData} />
          <SkillsAssessment reportData={reportData} />
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <StrengthsCard strengths={reportData.strengths} />
          <WeaknessesCard reportData={reportData} />
          <RecommendationsCard reportData={reportData} />
        </div>

        {/* Disclaimer */}
        <DisclaimerCard />
      </div>
    </div>
  );
};

export default ReportLayout;
