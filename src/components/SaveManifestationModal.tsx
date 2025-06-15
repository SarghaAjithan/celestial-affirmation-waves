
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SaveManifestationModalProps {
  open: boolean;
  onSave: (title: string) => void;
  onCancel: () => void;
  defaultValue?: string;
}

const SaveManifestationModal = ({ open, onSave, onCancel, defaultValue = "" }: SaveManifestationModalProps) => {
  const [title, setTitle] = useState(defaultValue);

  return (
    <Dialog open={open} onOpenChange={open => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Name your manifestation</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Manifestation name"
          value={title}
          className="mb-4"
          maxLength={50}
          onChange={e => setTitle(e.target.value)}
          autoFocus
        />
        <DialogFooter>
          <Button variant="secondary" onClick={onCancel}>Cancel</Button>
          <Button
            onClick={() => !!title.trim() && onSave(title.trim())}
            disabled={!title.trim()}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white"
          >
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default SaveManifestationModal;
