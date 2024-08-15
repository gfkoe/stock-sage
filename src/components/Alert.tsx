import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
type AlertInfo = {
  alertTitle: string;
  alertDescription: string;
  onClose: () => void;
};
export default function AlertComponent({
  alertTitle,
  alertDescription,
  onClose,
}: AlertInfo) {
  return (
    <Alert
      className="error-alert flex items-center justify-between max-w-md transition duration-500 ease-out translate-y-4 animate-slideIn"
      variant="destructive"
    >
      <div className="flex items-start">
        <AlertCircle className="h-4 w-4 mr-2 mt-1" />
        <div>
          <AlertTitle>{alertTitle}</AlertTitle>
          <AlertDescription>{alertDescription}</AlertDescription>
        </div>
      </div>
      <Button className="text-xs ml-auto" variant="outline" onClick={onClose}>
        OK
      </Button>
    </Alert>
  );
}
