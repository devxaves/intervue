"use client";
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
  explanation: string;
  userAnswer?: string;
  isCorrect?: boolean;
}

interface QuizSummary {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number;
  topicMastery: string;
  areasToImprove: string[];
  feedback: string;
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
  const [showExplanation, setShowExplanation] = useState(false);
  const [quizSummary, setQuizSummary] = useState<QuizSummary | null>(null);

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
        Generate a ${quizConfig.difficulty} difficulty quiz on the topic of "${quizConfig.topic}" with exactly ${quizConfig.numQuestions} multiple choice questions. Give relatively easy questions.
        Return only a valid JSON array without any markdown formatting where each object has:
        - "question": the question text
        - "options": an array of 4 possible answers
        - "correctAnswer": the correct answer (must exactly match one of the options)
        - "explanation": a brief explanation of why the correct answer is right (2-3 sentences)
        
        Example format:
        [
          {
            "question": "What is the capital of France?",
            "options": ["London", "Berlin", "Paris", "Madrid"],
            "correctAnswer": "Paris",
            "explanation": "Paris is the capital and most populous city of France. It has been one of Europe's major centers of finance, diplomacy, commerce, fashion, gastronomy, science, and arts since the 17th century."
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
    const currentQuestion = updatedQuestions[currentQuestionIndex];
    currentQuestion.userAnswer = answer;
    currentQuestion.isCorrect = answer === currentQuestion.correctAnswer;
    setQuizQuestions(updatedQuestions);
    setShowExplanation(true);

    // Move to next question after explanation is shown
    setTimeout(() => {
      if (currentQuestionIndex < quizQuestions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setShowExplanation(false);
      } else {
        calculateScoreAndSummary();
        setQuizCompleted(true);
      }
    }, 3000);
  };

  const calculateScoreAndSummary = () => {
    const correctAnswers = quizQuestions.filter(q => q.userAnswer === q.correctAnswer).length;
    const totalQuestions = quizQuestions.length;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    
    setScore(correctAnswers);
    
    // Generate feedback based on performance
    let topicMastery = '';
    let areasToImprove: string[] = [];
    let feedback = '';
    
    if (accuracy >= 90) {
      topicMastery = 'Expert';
      feedback = 'Outstanding! You have an excellent understanding of this topic.';
    } else if (accuracy >= 70) {
      topicMastery = 'Proficient';
      feedback = 'Good job! You have a solid understanding but there is room for improvement.';
      areasToImprove = ['Review specific details', 'Practice application of concepts'];
    } else if (accuracy >= 50) {
      topicMastery = 'Intermediate';
      feedback = 'Not bad! You have basic knowledge but need to study more.';
      areasToImprove = ['Focus on fundamental concepts', 'Review common misconceptions'];
    } else {
      topicMastery = 'Beginner';
      feedback = 'Keep learning! You should spend more time studying this topic.';
      areasToImprove = ['Start with basics', 'Practice with simpler questions first'];
    }
    
    setQuizSummary({
      score: correctAnswers,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      accuracy,
      topicMastery,
      areasToImprove,
      feedback
    });
  };

  const restartQuiz = () => {
    setQuizStarted(false);
    setQuizCompleted(false);
    setQuizQuestions([]);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
    setQuizSummary(null);
  };

  const retrySameQuiz = () => {
    setQuizCompleted(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    setShowExplanation(false);
    setQuizSummary(null);
    // Reset user answers
    const resetQuestions = quizQuestions.map(q => ({ ...q, userAnswer: undefined, isCorrect: undefined }));
    setQuizQuestions(resetQuestions);
  };

  // Abstract background shapes component
  const BackgroundShapes = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute -top-40 -right-32 w-80 h-80 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
      <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50  to-blue-400 py-8 px-4 relative overflow-hidden">
      <BackgroundShapes />
      
      <div className="max-w-2xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Live Quiz Generator
          </h1>
          <p className="text-blue-600">
            Test your knowledge on any topic with AI-powered quizzes
          </p>
        </motion.div>

        {!quizStarted && !quizCompleted && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 mb-8 border border-white/20"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="p-3 bg-blue-100 rounded-full mr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold text-gray-800">Create Your Quiz</h2>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  Topic
                </label>
                <input
                  type="text"
                  name="topic"
                  value={quizConfig.topic}
                  onChange={handleInputChange}
                  placeholder="e.g., Science, History, Programming"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  Number of Questions: {quizConfig.numQuestions}
                </label>
                <input
                  type="range"
                  name="numQuestions"
                  min="3"
                  max="20"
                  value={quizConfig.numQuestions}
                  onChange={handleInputChange}
                  className="w-full h-2 bg-blue-100 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>3</span>
                  <span>10</span>
                  <span>20</span>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Difficulty Level
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['easy', 'medium', 'hard'] as const).map(level => (
                    <button
                      key={level}
                      onClick={() => setQuizConfig(prev => ({ ...prev, difficulty: level }))}
                      className={`py-2 rounded-lg font-medium transition-all flex items-center justify-center ${
                        quizConfig.difficulty === level
                          ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
              
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-100 text-red-700 rounded-lg flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {error}
                </motion.div>
              )}
              
              <button
                onClick={generateQuiz}
                disabled={loading || !quizConfig.topic.trim()}
                className={`w-full py-3 rounded-xl font-semibold transition-all flex items-center justify-center ${
                  loading || !quizConfig.topic.trim()
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg'
                }`}
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Quiz
                  </>
                )}
              </button>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {quizStarted && !quizCompleted && quizQuestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50"
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative overflow-hidden">
                {/* Progress bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
                
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm font-medium text-blue-600 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestionIndex}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-semibold text-gray-800 mb-6">
                      {quizQuestions[currentQuestionIndex].question}
                    </h3>

                    <div className="space-y-3">
                      {quizQuestions[currentQuestionIndex].options.map((option, index) => (
                        <motion.button
                          key={index}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => !showExplanation && handleAnswerSelect(option)}
                          disabled={showExplanation}
                          className={`w-full text-left p-4 rounded-xl border transition-all flex items-start text-black ${
                            showExplanation 
                              ? option === quizQuestions[currentQuestionIndex].correctAnswer
                                ? 'bg-green-100 border-green-500 text-green-700'
                                : option === quizQuestions[currentQuestionIndex].userAnswer
                                  ? 'bg-red-100 border-red-500 text-red-700'
                                  : 'border-gray-200 bg-gray-50'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                          <span>{option}</span>
                          {showExplanation && option === quizQuestions[currentQuestionIndex].correctAnswer && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-green-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                          {showExplanation && option === quizQuestions[currentQuestionIndex].userAnswer && option !== quizQuestions[currentQuestionIndex].correctAnswer && (
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-auto text-red-500 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                          )}
                        </motion.button>
                      ))}
                    </div>

                    {showExplanation && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200"
                      >
                        <div className="flex items-start">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div>
                            <p className="font-medium text-blue-800">Explanation:</p>
                            <p className="text-blue-700">{quizQuestions[currentQuestionIndex].explanation}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {quizCompleted && quizSummary && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-white/20"
            >
              <div className="text-center mb-8">
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                  className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <span className="text-3xl font-bold text-white">{quizSummary.score}/{quizSummary.totalQuestions}</span>
                </motion.div>
                
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  {quizSummary.score === quizSummary.totalQuestions 
                    ? 'Perfect Score! 🎉' 
                    : quizSummary.score >= quizSummary.totalQuestions * 0.7 
                      ? 'Great Job! 👍' 
                      : quizSummary.score >= quizSummary.totalQuestions * 0.5 
                        ? 'Good Effort! 😊' 
                        : 'Keep Practicing! 💪'}
                </h2>
                
                <p className="text-gray-600 mb-6">{quizSummary.feedback}</p>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-blue-600">{quizSummary.correctAnswers}</div>
                    <div className="text-sm text-blue-500">Correct</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-red-600">{quizSummary.incorrectAnswers}</div>
                    <div className="text-sm text-red-500">Incorrect</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-xl">
                    <div className="text-2xl font-bold text-green-600">{Math.round(quizSummary.accuracy)}%</div>
                    <div className="text-sm text-green-500">Accuracy</div>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-xl">
                    <div className="text-xl font-bold text-purple-600">{quizSummary.topicMastery}</div>
                    <div className="text-sm text-purple-500">Mastery Level</div>
                  </div>
                </div>
                
                {quizSummary.areasToImprove.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Areas to Improve
                    </h3>
                    <ul className="text-left max-w-md mx-auto">
                      {quizSummary.areasToImprove.map((area, index) => (
                        <li key={index} className="flex items-start mb-2">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className='text-black'>{area}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={retrySameQuiz}
                    className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-600 transition shadow-md hover:shadow-lg flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Try Again
                  </button>
                  <button
                    onClick={restartQuiz}
                    className="px-6 py-3 bg-white text-blue-600 border border-blue-200 rounded-xl font-medium hover:bg-blue-50 transition flex items-center justify-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    New Quiz
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Add custom animations */}
      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default QuizPage;