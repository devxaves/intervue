import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface QuizConfig {
  topic: string;
  numQuestions: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  userAnswer?: string;
}

const QuizPage = () => {
  const [quizConfig, setQuizConfig] = useState<QuizConfig>({
    topic: '',
    numQuestions: 5,
    difficulty: 'medium'
  });
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [score, setScore] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setQuizConfig(prev => ({
      ...prev,
      [name]: name === 'numQuestions' ? parseInt(value) : value
    }));
  };

  const generateQuiz = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const prompt = `
        Generate a ${quizConfig.difficulty} difficulty quiz on the topic of "${quizConfig.topic}" with exactly ${quizConfig.numQuestions} multiple choice questions.
        Return only a valid JSON array without any markdown formatting where each object has:
        - "question": the question text
        - "options": an array of 4 possible answers
        - "correctAnswer": the correct answer (must exactly match one of the options)
        
        Example format:
        [
          {
            "question": "What is the capital of France?",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correctAnswer": "Paris"
          }
        ]
      `;

      const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': process.env.NEXT_PUBLIC_GEMINI_API_KEY || ''
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();
      
      // Extract the text from the response
      const responseText = data.candidates[0].content.parts[0].text;
      
      // Clean the response (remove markdown code blocks if present)
      const cleanedResponse = responseText.replace(/```json\n?|\n?```/g, '');
      
      // Parse the JSON
      const questions = JSON.parse(cleanedResponse);
      
      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('Invalid response format from AI');
      }
      
      setQuizQuestions(questions);
      setQuizStarted(true);
      setCurrentQuestionIndex(0);
    } catch (err) {
      console.error('Error generating quiz:', err);
      setError('Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    const updatedQuestions = [...quizQuestions];
    updatedQuestions[currentQuestionIndex].userAnswer = answer;
    setQuizQuestions(updatedQuestions);

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
      } else {
        calculateScore();
        setQuizCompleted(true);
      }
    }, 500);
  };

  const calculateScore = () => {
    const correctAnswers = quizQuestions.filter(
      q => q.userAnswer === q.correctAnswer
    ).length;
    setScore(correctAnswers);
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
  };

  const retrySameQuiz = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    // Reset user answers
    const resetQuestions = quizQuestions.map(q => ({ ...q, userAnswer: undefined }));
    setQuizQuestions(resetQuestions);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-blue-800 mb-2"
        >
          Live Quiz Generator
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-blue-600 mb-8"
        >
          Test your knowledge on any topic with AI-powered quizzes
        </motion.p>

        {!quizStarted && !quizCompleted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-6 mb-8"
          >
            <h2 className="text-2xl font-semibold text-blue-800 mb-6">Create Your Quiz</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={quizConfig.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Science, History, Programming"
                  className="w-full px-4 py-2 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Number of Questions
                </label>
                <input
                  type="range"
                  name="numQuestions"
                  min="3"
                  max="20"
                  value={quizConfig.numQuestions}
                  onChange={handleInputChange}
                  className="w-full"
                />
                <div className="text-center text-blue-600 font-medium">
                  {quizConfig.numQuestions} questions
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-blue-700 mb-1">
                  Difficulty Level
                </label>
                <div className="flex space-x-4">
                  {(['easy', 'medium', 'hard'] as const).map(level => (
                    <label key={level} className="flex items-center">
                      <input
                        type="radio"
                        name="difficulty"
                        value={level}
                        checked={quizConfig.difficulty === level}
                        onChange={handleInputChange}
                        className="mr-2 text-blue-600"
                      />
                      <span className="capitalize">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg">
                  {error}
                </div>
              )}
              
              <button
                onClick={generateQuiz}
                disabled={loading || !quizConfig.topic.trim()}
                className={`w-full py-3 rounded-lg font-semibold transition-all ${
                  loading || !quizConfig.topic.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Quiz...
                  </span>
                ) : (
                  'Generate Quiz'
                )}
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {quizStarted && !quizCompleted && quizQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm font-medium text-blue-600">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </div>
                  <div className="w-32 bg-blue-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    ></div>
                  </div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {quizQuestions[currentQuestionIndex].question}
                </h3>

                <div className="space-y-3">
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswerSelect(option)}
                      className={`w-full text-left p-4 rounded-lg border transition-all ${
                        quizQuestions[currentQuestionIndex].userAnswer === option
                          ? 'border-blue-500 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      }`}
                    >
                      {option}
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {quizCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl shadow-lg p-6 text-center"
            >
              <div className="text-5xl font-bold text-blue-600 mb-2">{score}/{quizQuestions.length}</div>
              <div className="text-2xl font-semibold text-gray-800 mb-4">
                {score === quizQuestions.length 
                  ? 'Perfect Score! 🎉' 
                  : score >= quizQuestions.length * 0.7 
                    ? 'Great Job! 👍' 
                    : score >= quizQuestions.length * 0.5 
                      ? 'Good Effort! 😊' 
                      : 'Keep Practicing! 💪'}
              </div>
              
              <div className="mb-6">
                <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-600 transition-all duration-1000" 
                    style={{ width: `${(score / quizQuestions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={retrySameQuiz}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  Try Again
                </button>
                <button
                  onClick={restartQuiz}
                  className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-lg font-medium hover:bg-blue-50 transition"
                >
                  New Quiz
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default QuizPage;