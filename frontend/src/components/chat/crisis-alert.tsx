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
            {"\u042D\u041A\u0421\u0422\u0420\u0415\u041D\u041D\u0410\u042F \u041F\u041E\u041C\u041E\u0429\u042C"}
          </DialogTitle>
          <DialogDescription className="text-center text-body-md">
            {"\u0415\u0441\u043B\u0438 \u0432\u044B \u0438\u043B\u0438 \u043A\u0442\u043E-\u0442\u043E \u0440\u044F\u0434\u043E\u043C \u0441 \u0432\u0430\u043C\u0438 \u043D\u0430\u0445\u043E\u0434\u0438\u0442\u0441\u044F \u0432 \u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438, \u043E\u0431\u0440\u0430\u0442\u0438\u0442\u0435\u0441\u044C \u0437\u0430 \u043F\u043E\u043C\u043E\u0449\u044C:"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="rounded-lg bg-error-50 p-4 text-center">
            <p className="text-body-sm font-medium text-neutral-700">
              {"\u0422\u0435\u043B\u0435\u0444\u043E\u043D \u0434\u043E\u0432\u0435\u0440\u0438\u044F:"}
            </p>
            <a
              href="tel:88002000122"
              className="text-heading-3 font-bold text-error-700 hover:underline"
            >
              8-800-2000-122
            </a>
            <p className="text-caption text-neutral-600 mt-1">
              {"\u0411\u0435\u0441\u043F\u043B\u0430\u0442\u043D\u043E, \u043A\u0440\u0443\u0433\u043B\u043E\u0441\u0443\u0442\u043E\u0447\u043D\u043E"}
            </p>
          </div>

          <div className="text-center text-body-sm text-neutral-700">
            {"\u042D\u043A\u0441\u0442\u0440\u0435\u043D\u043D\u0430\u044F \u043F\u043E\u043C\u043E\u0449\u044C: "}
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
              {"\u041F\u043E\u0437\u0432\u043E\u043D\u0438\u0442\u044C 8-800-2000-122"}
            </a>
          </Button>

          <button
            className="w-full text-center text-body-sm text-neutral-600 hover:text-neutral-800 transition-colors py-2"
            onClick={onSafe}
          >
            {"\u042F \u0432 \u0431\u0435\u0437\u043E\u043F\u0430\u0441\u043D\u043E\u0441\u0442\u0438, \u043F\u0440\u043E\u0434\u043E\u043B\u0436\u0438\u0442\u044C"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
