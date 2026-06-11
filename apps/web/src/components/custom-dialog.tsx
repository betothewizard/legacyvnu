import { CircleAlert } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
} from "~/src/components/ui/dialog";
import { Button } from "~/src/components/ui/button";

interface DialogProps {
  showWarning: boolean;
  setShowWarning: React.Dispatch<React.SetStateAction<boolean>>;
  currentQuestionsLength: number;
}
export const CustomDialog = (props: DialogProps) => {
  return (
    <Dialog open={props.showWarning} onOpenChange={props.setShowWarning}>
      <DialogContent className="flex max-w-md flex-col items-center space-y-4 rounded-xl border-2 border-black bg-white p-10">
        <CircleAlert size={50}></CircleAlert>
        <DialogDescription className="text-center text-lg">
          Bạn cần làm đủ {props.currentQuestionsLength} câu trên trang này để
          kiểm tra kết quả
        </DialogDescription>
        <Button onClick={() => props.setShowWarning(false)}>
          Tiếp tục làm
        </Button>
      </DialogContent>
    </Dialog>
  );
};
