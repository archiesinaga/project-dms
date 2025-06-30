'use client';

import { useState } from 'react';
import { DragDropContext, DropResult } from 'react-beautiful-dnd';
import { useToast } from '@/components/ui/use-toast';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

// Types
interface WorkflowStep {
  id: string;
  type: 'approval' | 'notification' | 'action';
  title: string;
  config: {
    assignees?: string[];
    deadline?: number;
    action?: string;
    message?: string;
  };
}

interface WorkflowSettings {
  name: string;
  description?: string;
  isActive: boolean;
  autoStart: boolean;
  notifyOnComplete: boolean;
}

// Components
const StepsList = ({ 
  steps, 
  onStepChange 
}: { 
  steps: WorkflowStep[]; 
  onStepChange: (steps: WorkflowStep[]) => void;
}) => {
  return (
    <ScrollArea className="h-[400px]">
      <div className="space-y-2 p-4">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{step.title}</h3>
                <p className="text-sm text-gray-500">Type: {step.type}</p>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const newSteps = [...steps];
                    newSteps.splice(index, 1);
                    onStepChange(newSteps);
                  }}
                >
                  Remove
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {/* Add edit step logic */}}
                >
                  Edit
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};

const AddStepButton = ({ onAdd }: { onAdd: () => void }) => (
  <Button 
    className="w-full mt-4" 
    onClick={onAdd}
  >
    Add Workflow Step
  </Button>
);

const WorkflowPreview = ({ steps }: { steps: WorkflowStep[] }) => (
  <Card className="mt-4 p-4">
    <h3 className="font-medium mb-2">Workflow Preview</h3>
    {steps.length === 0 ? (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No steps added to the workflow yet
        </AlertDescription>
      </Alert>
    ) : (
      <div className="flex items-center gap-2">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center">
              {index + 1}
            </div>
            {index < steps.length - 1 && (
              <div className="w-8 h-0.5 bg-gray-200" />
            )}
          </div>
        ))}
      </div>
    )}
  </Card>
);

const WorkflowSettings = ({ 
  steps,
  onSave 
}: { 
  steps: WorkflowStep[];
  onSave: (settings: WorkflowSettings) => void;
}) => {
  const [settings, setSettings] = useState<WorkflowSettings>({
    name: '',
    description: '',
    isActive: true,
    autoStart: false,
    notifyOnComplete: true
  });

  return (
    <Card className="mt-4 p-4">
      <h3 className="font-medium mb-4">Workflow Settings</h3>
      {/* Add settings form here */}
      <Button 
        className="w-full"
        disabled={steps.length === 0}
        onClick={() => onSave(settings)}
      >
        Save Workflow
      </Button>
    </Card>
  );
};

// Main Component
export const WorkflowDesigner = () => {
  const [steps, setSteps] = useState<WorkflowStep[]>([]);
  const { toast } = useToast();

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const items = Array.from(steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setSteps(items);
  };

  const handleStepChange = (newSteps: WorkflowStep[]) => {
    setSteps(newSteps);
  };

  const handleAddStep = () => {
    const newStep: WorkflowStep = {
      id: crypto.randomUUID(),
      type: 'approval',
      title: `Step ${steps.length + 1}`,
      config: {}
    };
    setSteps([...steps, newStep]);
  };

  const handleSaveWorkflow = async (settings: WorkflowSettings) => {
    try {
      // Add API call to save workflow
      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save workflow",
      });
    }
  };
    
  return (
    <div className="workflow-designer space-y-4">
      <Card className="p-4">
        <h2 className="text-2xl font-bold mb-4">Workflow Designer</h2>
        <DragDropContext onDragEnd={handleDragEnd}>
          <StepsList 
            steps={steps} 
            onStepChange={handleStepChange} 
          />
          <AddStepButton onAdd={handleAddStep} />
        </DragDropContext>
      </Card>
      
      <WorkflowPreview steps={steps} />
      <WorkflowSettings 
        steps={steps} 
        onSave={handleSaveWorkflow} 
      />
    </div>
  );
};