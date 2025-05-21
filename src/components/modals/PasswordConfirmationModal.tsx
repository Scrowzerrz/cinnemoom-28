import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  // DialogClose, // Not explicitly used in the final design, but good to know it's available
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth'; // To potentially get current user's email for verification

interface PasswordConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => Promise<void>; // Parent handles actual password check and action
  message: string;
  title?: string;
}

export const PasswordConfirmationModal: React.FC<PasswordConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  message,
  title = "Confirmação Necessária",
}) => {
  const [enteredPassword, setEnteredPassword] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { session } = useAuth(); // Get current user session

  // Reset state when modal is opened or closed
  useEffect(() => {
    if (isOpen) {
      setEnteredPassword('');
      setErrorMessage(null);
      // setIsVerifying(false); // Resetting isVerifying here might hide loading state if modal is closed then quickly reopened by parent logic
    }
    // When closing, ensure isVerifying is false so it doesn't persist if closed mid-verification
    if (!isOpen) {
        setIsVerifying(false);
    }
  }, [isOpen]);

  const handleConfirm = async () => {
    if (!enteredPassword) {
      setErrorMessage("Por favor, insira sua senha.");
      return;
    }
    setIsVerifying(true);
    setErrorMessage(null);
    try {
      // The onConfirm prop is expected to handle the actual password verification
      // and the subsequent action. It should throw an error if verification fails.
      await onConfirm(enteredPassword);
      // If onConfirm resolves without error, it means success.
      // The parent component is responsible for closing the modal via its logic that sets `isOpen` to false.
      // This modal does not call onClose() directly on success to give parent full control.
    } catch (error: any) {
      setErrorMessage(error.message || "Senha incorreta ou falha na ação.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDialogClose = (open: boolean) => {
    if (!open && !isVerifying) { // Prevent closing if verification is in progress (optional, but good UX)
      onClose();
    } else if (!open && isVerifying) {
        // If we want to allow closing during verification (e.g. by Esc key or overlay click)
        // then we should also cancel any ongoing verification if possible, or at least reset isVerifying.
        // For now, this logic means if isVerifying is true, onOpenChange(false) won't call onClose().
        // A dedicated cancel button would still work.
        // Alternative: always call onClose() and let parent decide. For simplicity:
        onClose();
    }
  };
  
  // It's important that the user cannot proceed if there's no active session,
  // as password verification typically needs user context (e.g., email).
  // This modal assumes it's invoked for an already authenticated user.
  useEffect(() => {
    if (isOpen && !session?.user?.email) {
        // This case should ideally be handled before opening the modal.
        // If modal opens somehow, show error or close.
        console.error("PasswordConfirmationModal: Tentativa de abrir sem email do usuário na sessão.");
        setErrorMessage("Não é possível confirmar a senha sem uma sessão de usuário ativa com email.");
        // onClose(); // Optionally auto-close
    }
  }, [isOpen, session, onClose]);


  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[425px] bg-movieDark border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {message && <DialogDescription className="text-gray-400 pt-2">{message}</DialogDescription>}
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 items-center gap-2"> {/* Simplified layout for label above input */}
            <label htmlFor="password-confirm" className="text-sm font-medium text-gray-300">
              Senha
            </label>
            <Input
              id="password-confirm"
              type="password"
              value={enteredPassword}
              onChange={(e) => setEnteredPassword(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white focus:border-movieRed placeholder-gray-500"
              placeholder="Digite sua senha atual"
              autoFocus
              disabled={isVerifying || !session?.user?.email} // Disable if verifying or no email
            />
          </div>
          {errorMessage && (
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
          )}
          {!session?.user?.email && isOpen && (
             <p className="text-sm text-yellow-500 text-center">
                Não foi possível carregar informações do usuário para verificação.
             </p>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0 pt-2"> {/* Added pt-2 for spacing */}
          <Button 
            variant="outline" 
            onClick={onClose} 
            disabled={isVerifying} 
            className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
          >
            Cancelar
          </Button>
          <Button 
            type="button" 
            onClick={handleConfirm} 
            disabled={isVerifying || !session?.user?.email || !enteredPassword} // Disable if no password
            className="bg-movieRed hover:bg-red-700 text-white"
          >
            {isVerifying ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
