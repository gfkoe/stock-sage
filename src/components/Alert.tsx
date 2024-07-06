import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
type AlertInfo = {
  alertTitle: string;
  alertDescription: string;
};
export default function AlertComponent({
  alertTitle,
  alertDescription,
}: AlertInfo) {
  return (
    <Alert className="max-w-md" variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{alertTitle}</AlertTitle>
      <AlertDescription>{alertDescription}</AlertDescription>
    </Alert>
  );
}
