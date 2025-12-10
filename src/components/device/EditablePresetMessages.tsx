import { useState } from 'react';
import { PresetMessage } from '@/types/device';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { MessageSquare, Edit, Save, X, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface EditablePresetMessagesProps {
  messages: PresetMessage[];
  onUpdate?: (messages: PresetMessage[]) => void;
  maxSlots?: number;
}

export function EditablePresetMessages({
  messages,
  onUpdate,
  maxSlots = 6,
}: EditablePresetMessagesProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [error, setError] = useState('');

  const CHARACTER_LIMIT = 160;

  // Validation: alphanumeric and Hebrew only
  const validateMessage = (text: string): { valid: boolean; error?: string } => {
    if (text.length === 0) {
      return { valid: false, error: 'Message cannot be empty' };
    }

    if (text.length > CHARACTER_LIMIT) {
      return { valid: false, error: `Message exceeds ${CHARACTER_LIMIT} character limit` };
    }

    // Regex for alphanumeric (including spaces and common punctuation) + Hebrew
    // Hebrew range: \u0590-\u05FF
    const validPattern = /^[a-zA-Z0-9\s.,!?'\-\u0590-\u05FF]+$/;
    
    if (!validPattern.test(text)) {
      return {
        valid: false,
        error: 'Only alphanumeric characters, Hebrew text, and basic punctuation allowed',
      };
    }

    return { valid: true };
  };

  const handleStartEdit = (message: PresetMessage) => {
    setEditingId(message.id);
    setEditValue(message.message);
    setError('');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValue('');
    setError('');
  };

  const handleSave = (messageId: string) => {
    const validation = validateMessage(editValue.trim());
    
    if (!validation.valid) {
      setError(validation.error || 'Invalid message');
      return;
    }

    const updatedMessages = messages.map((msg) =>
      msg.id === messageId ? { ...msg, message: editValue.trim() } : msg
    );

    onUpdate?.(updatedMessages);

    toast({
      title: 'Preset Updated',
      description: 'Message has been saved successfully',
    });

    setEditingId(null);
    setEditValue('');
    setError('');
  };

  const handleAddMessage = () => {
    if (messages.length >= maxSlots) {
      toast({
        title: 'Maximum Slots Reached',
        description: `You can only have ${maxSlots} preset messages`,
        variant: 'destructive',
      });
      return;
    }

    const newMessage: PresetMessage = {
      id: `preset-${Date.now()}`,
      slot: messages.length + 1,
      message: 'New preset message',
    };

    onUpdate?.([...messages, newMessage]);
    
    // Automatically start editing the new message
    setEditingId(newMessage.id);
    setEditValue(newMessage.message);
  };

  const handleDelete = (messageId: string) => {
    if (confirm('Are you sure you want to delete this preset message?')) {
      const updatedMessages = messages
        .filter((msg) => msg.id !== messageId)
        .map((msg, index) => ({ ...msg, slot: index + 1 })); // Re-number slots

      onUpdate?.(updatedMessages);

      toast({
        title: 'Preset Deleted',
        description: 'Message has been removed',
      });
    }
  };

  const characterCount = editValue.length;
  const isNearLimit = characterCount > CHARACTER_LIMIT * 0.8;
  const isOverLimit = characterCount > CHARACTER_LIMIT;

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-accent" />
            Preset Messages
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleAddMessage}>
            Add Message
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {messages.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {messages.map((preset) => (
              <div
                key={preset.id}
                className={`group relative rounded-lg border-2 p-4 transition-all ${
                  editingId === preset.id
                    ? 'border-accent bg-accent/5 shadow-lg'
                    : 'border-border/50 bg-muted/50 hover:border-accent/50 hover:shadow-md'
                }`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <Badge variant="outline" className="font-mono">
                    #{preset.slot}
                  </Badge>
                  {editingId !== preset.id && (
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => handleStartEdit(preset)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0 text-destructive hover:bg-destructive/10"
                        onClick={() => handleDelete(preset.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>

                {editingId === preset.id ? (
                  <div className="space-y-2">
                    <Textarea
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className={`min-h-[100px] resize-none text-sm ${
                        error ? 'border-destructive' : ''
                      }`}
                      placeholder="Enter preset message..."
                      autoFocus
                    />
                    
                    {/* Character Counter */}
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`font-medium ${
                          isOverLimit
                            ? 'text-destructive'
                            : isNearLimit
                            ? 'text-orange-600'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {characterCount} / {CHARACTER_LIMIT}
                      </span>
                      {isOverLimit && (
                        <Badge variant="destructive" className="gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Over Limit
                        </Badge>
                      )}
                    </div>

                    {error && (
                      <Alert variant="destructive" className="py-2">
                        <AlertDescription className="text-xs">{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleSave(preset.id)}
                        className="flex-1 gap-1"
                      >
                        <Save className="h-3 w-3" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCancelEdit}
                        className="flex-1"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{preset.message}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed py-12 text-center">
            <MessageSquare className="mb-3 h-12 w-12 text-muted-foreground/50" />
            <p className="font-medium text-muted-foreground">No preset messages configured</p>
            <Button variant="outline" size="sm" onClick={handleAddMessage} className="mt-4">
              Add First Message
            </Button>
          </div>
        )}

        {/* Helper Info */}
        <Alert className="mt-4 border-blue-200 bg-blue-50">
          <AlertTriangle className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-sm text-blue-900">
            Messages limited to {CHARACTER_LIMIT} characters. Supports alphanumeric characters,
            Hebrew text, and basic punctuation (. , ! ? ' -).
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}