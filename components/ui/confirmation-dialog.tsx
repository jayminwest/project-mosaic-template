"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { useState } from "react"

export interface ConfirmationDialogProps {
  title: string
  description: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (reason?: string) => void
  onCancel?: () => void
  confirmText?: string
  cancelText?: string
  destructive?: boolean
  showReasonField?: boolean
  reasonLabel?: string
  reasonPlaceholder?: string
  isLoading?: boolean
}

export function ConfirmationDialog({
  title,
  description,
  open,
  onOpenChange,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  destructive = false,
  showReasonField = false,
  reasonLabel = "Reason (optional)",
  reasonPlaceholder = "Please tell us why...",
  isLoading = false,
}: ConfirmationDialogProps) {
  const [reason, setReason] = useState<string>("")

  const handleConfirm = () => {
    onConfirm(showReasonField ? reason : undefined)
    if (!isLoading) {
      setReason("")
    }
  }

  const handleCancel = () => {
    onCancel?.()
    setReason("")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        
        {showReasonField && (
          <div className="py-4">
            <label htmlFor="reason" className="text-sm font-medium mb-2 block">
              {reasonLabel}
            </label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={reasonPlaceholder}
              className="w-full"
            />
          </div>
        )}
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={handleCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button 
            variant={destructive ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
