import React from 'react';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, XCircle } from 'lucide-react';

interface PasswordStrength {
  score: number; // 0 to 4
  feedback: string;
  rules: {
    minChars: boolean;
    uppercase: boolean;
    lowercase: boolean;
    number: boolean;
    specialChar: boolean;
  };
}

interface PasswordStrengthIndicatorProps {
  password: string;
}

// Function to calculate password strength score and feedback
const calculateStrength = (password: string): PasswordStrength => {
  if (!password) {
    return { score: 0, feedback: "Kezdj el gépelni...", rules: { minChars: false, uppercase: false, lowercase: false, number: false, specialChar: false } };
  }

  const rules = {
    minChars: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    specialChar: /[^A-Za-z0-9]/.test(password),
  };

  let score = 0;
  if (rules.minChars) score++;
  if (rules.uppercase) score++;
  if (rules.lowercase) score++;
  if (rules.number) score++;
  if (rules.specialChar) score++;
  
  // Max score is 5, but we map it to 4 for simplicity in progress bar (0-100%)
  const finalScore = Math.min(score, 4);

  let feedback = "";
  if (finalScore === 0) feedback = "Túl rövid";
  else if (finalScore === 1) feedback = "Gyenge";
  else if (finalScore === 2) feedback = "Közepes";
  else if (finalScore === 3) feedback = "Jó";
  else if (finalScore >= 4) feedback = "Erős";

  return { score: finalScore, feedback, rules };
};

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const { score, feedback, rules } = calculateStrength(password);
  const progressValue = score * 25;

  const getProgressColor = (score: number) => {
    if (score === 0) return "bg-gray-500";
    if (score === 1) return "bg-red-500";
    if (score === 2) return "bg-yellow-500";
    if (score === 3) return "bg-blue-500";
    if (score >= 4) return "bg-green-500";
    return "bg-gray-500";
  };
  
  const RuleItem: React.FC<{ condition: boolean, text: string }> = ({ condition, text }) => (
    <li className={`flex items-center text-sm transition-colors duration-300 ${condition ? 'text-green-400' : 'text-red-400'}`}>
      {condition ? <CheckCircle className="h-3 w-3 mr-2" /> : <XCircle className="h-3 w-3 mr-2" />}
      {text}
    </li>
  );

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-400">Jelszó erőssége:</span>
        <span className={`text-sm font-semibold ${getProgressColor(score)}`}>{feedback}</span>
      </div>
      <Progress value={progressValue} className={`h-2 ${getProgressColor(score)}`} />
      
      {password.length > 0 && (
        <ul className="grid grid-cols-2 gap-1 text-left pt-2">
          <RuleItem condition={rules.minChars} text="Min. 8 karakter" />
          <RuleItem condition={rules.uppercase} text="Nagybetű" />
          <RuleItem condition={rules.lowercase} text="Kisbetű" />
          <RuleItem condition={rules.number} text="Szám" />
          <RuleItem condition={rules.specialChar} text="Speciális karakter" />
        </ul>
      )}
    </div>
  );
};

export default PasswordStrengthIndicator;