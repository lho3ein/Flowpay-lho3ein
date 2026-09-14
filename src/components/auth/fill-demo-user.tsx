import { Button } from "@/components/ui/button";
import { LoginInput } from "@/validations/auth.schema";
import { UseFormReturn } from "react-hook-form";

type prpFill = {
  form: UseFormReturn<LoginInput>;
};

export const FillDemoUser = ({ form }: prpFill) => {
  const fillDemo = () => {
    form.setValue("email", "demo@flowpay.app");
    form.setValue("password", "@Demo1234");
  };
  return (
    <Button
      onClick={fillDemo}
      variant={"secondary"}
      size={"xs"}
      className={"cursor-pointer"}
    >
      پر شدن خودکار
    </Button>
  );
};
