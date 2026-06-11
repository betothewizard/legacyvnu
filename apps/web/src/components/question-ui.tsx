import { useState, useEffect } from "react";
import type { QuizQuestion } from "@legacyvnu/shared";
import { radio } from "../styles";
import { RadioGroup, RadioGroupItem } from "~/src/components/ui/radio-group";

import { Label } from "./ui/label";

interface IQuestionProps {
  question: QuizQuestion;
  onAnswerSelected: (questionIndex: number, answerIndex: number) => void;
  showResult: boolean;
}

const Question = (props: IQuestionProps) => {
  const { question, onAnswerSelected, showResult } = props;
  const [selected, setSelected] = useState<string>(
    question.selectedAnswerIndex !== undefined
      ? question.answers[question.selectedAnswerIndex].content
      : "",
  );

  useEffect(() => {
    if (question.selectedAnswerIndex !== undefined) {
      setSelected(
        question.answers[question.selectedAnswerIndex].content,
      );
    } else {
      setSelected("");
    }
  }, [question.selectedAnswerIndex, question.answers]);

  const isIncorrect =
    showResult &&
    question.selectedAnswerIndex !== undefined &&
    question.answers[question.selectedAnswerIndex].content !==
      question.correctAnswer;

  const handleValueChange = (value: string) => {
    setSelected(value);
    const selectedAnswerIndex = question.answers.findIndex(
      (answer: { id: number; content: string }) => answer.content === value,
    );
    if (selectedAnswerIndex !== -1) {
      onAnswerSelected(question.id, selectedAnswerIndex);
    }
  };

  return (
    <div className="mb-8">
      <div className="font-serif text-lg">
        Câu {question.id + 1}: {question.question}{" "}
        <span className="text-red-500">{isIncorrect && "(x)"} </span>
      </div>
      <RadioGroup
        className="flex flex-col flex-1"
        value={selected}
        onValueChange={handleValueChange}
      >
        {question.answers.map((answer: { id: number; content: string }, answerIndex: number) => (
          <div key={answer.id}>
            <RadioGroupItem
              value={answer.content}
              id={`answer-${question.id}-${answer.id}`}
              disabled={showResult}
              className="peer sr-only"
            />
            <Label
              htmlFor={`answer-${question.id}-${answer.id}`}
              className={`group flex cursor-pointer rounded-xl border border-b-2 px-2 py-3 shadow-lg transition-all bg-card text-card-foreground
                peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 text-md                ${
                  answerIndex === question.selectedAnswerIndex
                    ? "font-bold"
                    : ""
                } ${
                  !showResult &&
                  answerIndex === question.selectedAnswerIndex
                    ? radio.selected
                    : ""
                } ${
                  showResult && answer.content === question.correctAnswer
                    ? radio.correct
                    : ""
                } ${
                  showResult &&
                  answerIndex === question.selectedAnswerIndex &&
                  answer.content !== question.correctAnswer
                    ? radio.incorrect
                    : ""
                } `}
            >
              <div>{answer.content}</div>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export { Question };
