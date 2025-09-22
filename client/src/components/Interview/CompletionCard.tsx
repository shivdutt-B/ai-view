// import React from 'react';
// import { motion } from 'framer-motion';
// import { CheckCircle, FileText, Download, Share2 } from 'lucide-react';

// interface CompletionCardProps {
//   interviewCompleted: boolean;
// }

// const CompletionCard: React.FC<CompletionCardProps> = ({ interviewCompleted }) => {
//   if (!interviewCompleted) return null;

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.9, y: 20 }}
//       animate={{ opacity: 1, scale: 1, y: 0 }}
//       transition={{ duration: 0.5 }}
//       className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl shadow-lg border border-green-200 overflow-hidden"
//     >
//       <div className="p-6 text-white">
//         {/* Header */}
//         <div className="text-center mb-6">
//           <motion.div
//             initial={{ scale: 0 }}
//             animate={{ scale: 1 }}
//             transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
//             className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
//           >
//             <CheckCircle className="w-8 h-8 text-white" />
//           </motion.div>
//           <h3 className="text-xl font-bold mb-2">
//             🎉 Interview Complete!
//           </h3>
//           <p className="text-green-100 text-sm">
//             Great job! Your personalized report is being generated...
//           </p>
//         </div>

//         {/* Status Indicator */}
//         <div className="bg-white/10 rounded-lg p-4 mb-6">
//           <div className="flex items-center justify-between mb-2">
//             <span className="text-sm font-medium">Generating Report</span>
//             <span className="text-xs">Processing...</span>
//           </div>
//           <div className="w-full bg-white/20 rounded-full h-2">
//             <motion.div
//               className="bg-white h-2 rounded-full"
//               initial={{ width: 0 }}
//               animate={{ width: "100%" }}
//               transition={{ duration: 3, ease: "easeInOut" }}
//             />
//           </div>
//         </div>

//         {/* Action Buttons */}
//         <div className="space-y-3">
//           <motion.button
//             whileHover={{ scale: 1.02 }}
//             whileTap={{ scale: 0.98 }}
//             className="w-full bg-white text-green-600 font-medium py-3 px-4 rounded-lg flex items-center justify-center space-x-2 hover:bg-gray-50 transition-colors"
//           >
//             <FileText className="w-4 h-4" />
//             <span>View Report</span>
//           </motion.button>
          
//           <div className="grid grid-cols-2 gap-3">
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="bg-white/10 backdrop-blur-sm text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors text-sm"
//             >
//               <Download className="w-4 h-4" />
//               <span>Download</span>
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.02 }}
//               whileTap={{ scale: 0.98 }}
//               className="bg-white/10 backdrop-blur-sm text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-2 hover:bg-white/20 transition-colors text-sm"
//             >
//               <Share2 className="w-4 h-4" />
//               <span>Share</span>
//             </motion.button>
//           </div>
//         </div>

//         {/* Tip */}
//         <div className="mt-4 p-3 bg-white/10 rounded-lg">
//           <p className="text-xs text-green-100">
//             💡 Your report will include detailed feedback, skill assessments, and personalized recommendations for improvement.
//           </p>
//         </div>
//       </div>
//     </motion.div>
//   );
// };

// export default CompletionCard;
