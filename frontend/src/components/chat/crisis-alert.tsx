"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Phone } from "lucide-react";

interface CrisisAlertProps {
  open: boolean;
  onSafe: () => void;
}

export function CrisisAlert({ open, onSafe }: CrisisAlertProps) {
  return (
    <Dialog open={open}>
      <DialogContent
        className="max-w-md border-error-500"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-error-100 mb-4">
            <AlertTriangle className="h-7 w-7 text-error-600" />
          </div>
          <DialogTitle className="text-center text-error-700">
            {"ЭКСТРЕННАЯ ПОМОЩЬ"}
          </DialogTitle>
          <DialogDescription className="text-center text-body-md">
            {"Если вы или кто-то рядом с вами находится в опасности, обратитесь за помощь:"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg bg-error-50 p-4 text-center">
            <p className="text-body-sm font-medium text-neutral-700">
              {"Телефон доверия:"}
            </p>
            <a
              href="tel:88002000122"
              className="text-heading-3 font-bold text-error-700 hover:underline"
            >
              8-800-2000-122
            </a>
            <p className="text-caption text-neutral-600 mt-1">
              {"Бесплатно, круглосуточно"}
            </p>
          </div>

          <div className="text-center text-body-sm text-neutral-700">
            {"Экстренная помощь: "}
            <a
              href="tel:112"
              className="font-bold text-error-600 hover:underline"
            >
              112
            </a>
          </div>

          <Button
            size="lg"
            variant="danger"
            className="w-full"
            asChild
          >
            <a href="tel:88002000122">
              <Phone className="mr-2 h-5 w-5" />
              {"Позвонить 8-800-2000-122"}
            </a>
          </Button>

          <button
            className="w-full text-center text-body-sm text-neutral-600 hover:text-neutral-800 transition-colors py-2"
            onClick={onSafe}
          >
            {"Я в безопасности, продолжить"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
