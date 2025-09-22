import { Question } from '../slices/interviewSlice';
import { getEnvVar, createSecureHeaders, handleApiError } from '../../utils/apiUtils';
import { InterviewResponse } from '../../components/Report/types';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

export const generateInterviewQuestions = async (
  role: string,
  jobDescription?: string
): Promise<Question[]> => {
  try {
    const apiKey = getEnvVar('VITE_GEMINI_API_KEY');
    
    const systemPrompt = `You are an expert technical interviewer. Generate exactly 8 interview questions for a ${role} developer position.

${jobDescription ? `Job Description: ${jobDescription}\n\n` : ''}

Instructions:
1. Create questions that cover different aspects: technical skills, problem-solving, experience, and behavioral
2. Questions should be appropriate for the ${role} role
3. Mix of difficulty levels: 2-3 basic, 3-4 intermediate, 2-3 advanced
4. Include questions about best practices, real-world scenarios, and technical concepts
5. Make questions open-ended to allow for detailed responses

Return the response in this exact JSON format:
{
  "questions": [
    {
      "id": 1,
      "text": "Question text here",
      "category": "Technical|Problem-Solving|Experience|Behavioral"
    }
  ]
}

Categories to use:
- Technical: Core technology knowledge and concepts
- Problem-Solving: Algorithmic thinking and troubleshooting
- Experience: Past projects and practical application
- Behavioral: Soft skills and work approach

Generate varied, thoughtful questions that will help assess the candidate's suitability for the ${role} position.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: systemPrompt
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
      method: 'POST',
      headers: createSecureHeaders(),
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response format from Gemini API');
    }

    const textResponse = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON response
    const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Invalid JSON format in AI response');
    }
    
    const parsedResponse = JSON.parse(jsonMatch[0]);
    
    if (!parsedResponse.questions || !Array.isArray(parsedResponse.questions)) {
      throw new Error('Invalid questions format in AI response');
    }
    
    return parsedResponse.questions.map((q: any, index: number) => ({
      id: index + 1,
      text: q.text,
      category: q.category || 'Technical'
    }));
  } catch (error) {
    console.error('Error generating interview questions:', handleApiError(error, 'Generate Questions'));
    
    // Fallback questions if AI fails
    return getFallbackQuestions(role);
  }
};

/**
 * Returns fallback questions when AI service fails
 */
const getFallbackQuestions = (role: string): Question[] => {
  return [
    {
      id: 1,
      text: `Tell me about your experience with ${role} development and what interests you most about it.`,
      category: 'Experience'
    },
    {
      id: 2,
      text: `What are the key technologies and tools you use in ${role} development?`,
      category: 'Technical'
    },
    {
      id: 3,
      text: 'Describe a challenging project you worked on and how you overcame the difficulties.',
      category: 'Problem-Solving'
    },
    {
      id: 4,
      text: 'How do you stay updated with the latest trends and technologies in your field?',
      category: 'Behavioral'
    },
    {
      id: 5,
      text: `What are some best practices you follow in ${role} development?`,
      category: 'Technical'
    },
    {
      id: 6,
      text: 'Tell me about a time when you had to work with a difficult team member or client.',
      category: 'Behavioral'
    },
    {
      id: 7,
      text: 'How do you approach debugging and troubleshooting in your development process?',
      category: 'Problem-Solving'
    },
    {
      id: 8,
      text: 'Where do you see yourself in the next 2-3 years in your development career?',
      category: 'Behavioral'
    }
  ];
};

export interface SubmitInterviewData {
  sessionId?: string;
  role: string;
  interviewId?: string; // UUID for the interview
  questionAnswers: {
    questionId: number;
    question: string;
    category: string;
    textResponse: string;
    audioBlob?: Blob; // Audio blob for upload
    timestamp: string; // Changed from Date to string
  }[];
}

export const submitCompleteInterview = async (data: SubmitInterviewData): Promise<InterviewResponse> => {
  try {
    const formData = new FormData();
    
    // Add basic interview data
    formData.append('role', data.role);
    if (data.sessionId) {
      formData.append('sessionId', data.sessionId);
    }
    if (data.interviewId) {
      formData.append('interviewId', data.interviewId);
    }
    
    // Add questions and answers as JSON
    const questionAnswersData = data.questionAnswers.map(qa => ({
      questionId: qa.questionId,
      question: qa.question,
      category: qa.category,
      textResponse: qa.textResponse,
      timestamp: qa.timestamp
    }));
    formData.append('questionAnswers', JSON.stringify(questionAnswersData));
    
    // Add audio files
    data.questionAnswers.forEach((qa) => {
      if (qa.audioBlob) {
        const audioFileName = `question_${qa.questionId}.wav`;
        formData.append(`audio_${qa.questionId}`, qa.audioBlob, audioFileName);
      }
    });

    const response = await fetch(`${import.meta.env.VITE_SERVER_BASE_URL}/api/interview/submit`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Server error:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }

    const result = await response.json();
    
    return result;
  } catch (error) {
    console.error('❌ Interview submission failed:', error instanceof Error ? error.message : error);
    throw error;
  }
};
