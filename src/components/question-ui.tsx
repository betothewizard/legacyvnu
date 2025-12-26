import { useState, useEffect } from "react";
import type { QuestionType } from "../types/question";
import { radio } from "../styles";
import { RadioGroup, RadioGroupItem } from "~/src/components/ui/radio-group";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";

interface QuestionProps {
  questionType: QuestionType;
  onAnswerSelected: (questionIndex: number, answerIndex: number) => void;
  showResult: boolean;
}

const Question = (props: QuestionProps) => {
  const { questionType, onAnswerSelected, showResult } = props;
  const [selected, setSelected] = useState<string>(
    questionType.selectedAnswerIndex !== undefined
      ? questionType.answers[questionType.selectedAnswerIndex].content
      : "",
  );

  useEffect(() => {
    if (questionType.selectedAnswerIndex !== undefined) {
      setSelected(
        questionType.answers[questionType.selectedAnswerIndex].content,
      );
    } else {
      setSelected("");
    }
  }, [questionType.selectedAnswerIndex, questionType.answers]);

  const isIncorrect =
    showResult &&
    questionType.selectedAnswerIndex !== undefined &&
    questionType.answers[questionType.selectedAnswerIndex].content !==
      questionType.correctAnswer;

  const handleValueChange = (value: string) => {
    setSelected(value);
    const selectedAnswerIndex = questionType.answers.findIndex(
      (answer) => answer.content === value,
    );
    if (selectedAnswerIndex !== -1) {
      onAnswerSelected(questionType.id, selectedAnswerIndex);
    }
  };

  return (
    <div className="mb-8">
      <div className="font-serif text-lg">
        Câu {questionType.id + 1}: {questionType.question}{" "}
        <span className="text-red-500">{isIncorrect && "(x)"} </span>
      </div>
      <RadioGroup
        className="flex flex-col flex-1"
        value={selected}
        onValueChange={handleValueChange}
      >
        {questionType.answers.map((answer, answerIndex) => (
          <div key={answer.id}>
            <RadioGroupItem
              value={answer.content}
              id={`answer-${questionType.id}-${answer.id}`}
              disabled={showResult}
              className="peer sr-only"
            />
            <Label
              htmlFor={`answer-${questionType.id}-${answer.id}`}
              className={`group flex cursor-pointer rounded-xl border border-b-2 px-2 py-3 shadow-lg transition-all bg-card text-card-foregroun
                peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2 text-md

                ${
                  answerIndex === questionType.selectedAnswerIndex
                    ? "font-bold"
                    : ""
                } ${
                  !showResult &&
                  answerIndex === questionType.selectedAnswerIndex
                    ? radio.selected
                    : ""
                } ${
                  showResult && answer.content === questionType.correctAnswer
                    ? radio.correct
                    : ""
                } ${
                  showResult &&
                  answerIndex === questionType.selectedAnswerIndex &&
                  answer.content !== questionType.correctAnswer
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
