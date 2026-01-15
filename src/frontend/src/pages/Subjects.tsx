import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Plus, Edit2, Trash2, BookOpen } from 'lucide-react';
import { useSubjects, useAddSubject, useEditSubject, useRemoveSubject } from '../hooks/useQueries';
import { Skeleton } from '@/components/ui/skeleton';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
  '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
  '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
  '#ec4899', '#f43f5e',
];

export default function Subjects() {
  const { data: subjects = [], isLoading } = useSubjects();
  const addSubject = useAddSubject();
  const editSubject = useEditSubject();
  const removeSubject = useRemoveSubject();

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<{ id: string; name: string; color: string } | null>(null);

  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(PRESET_COLORS[0]);

  const handleAddSubject = async () => {
    if (!newSubjectName.trim()) return;

    const id = Date.now().toString();
    await addSubject.mutateAsync({
      id,
      name: newSubjectName.trim(),
      color: newSubjectColor,
    });

    setNewSubjectName('');
    setNewSubjectColor(PRESET_COLORS[0]);
    setIsAddDialogOpen(false);
  };

  const handleEditSubject = async () => {
    if (!editingSubject || !editingSubject.name.trim()) return;

    await editSubject.mutateAsync({
      id: editingSubject.id,
      name: editingSubject.name.trim(),
      color: editingSubject.color,
    });

    setEditingSubject(null);
    setIsEditDialogOpen(false);
  };

  const handleRemoveSubject = async (id: string) => {
    await removeSubject.mutateAsync(id);
  };

  const openEditDialog = (subject: { id: string; name: string; color: string }) => {
    setEditingSubject(subject);
    setIsEditDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Subjects</h2>
          <p className="text-muted-foreground mt-1">Manage your study subjects</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              New Subject
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Subject</DialogTitle>
              <DialogDescription>
                Add a new subject to track your studies
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="subject-name">Subject Name</Label>
                <Input
                  id="subject-name"
                  placeholder="e.g., Mathematics, Science, History"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Choose Color</Label>
                <div className="grid grid-cols-9 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      className={`h-10 w-10 rounded-md transition-all hover:scale-110 ${
                        newSubjectColor === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      style={{ backgroundColor: color }}
                      onClick={() => setNewSubjectColor(color)}
                    />
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={handleAddSubject}
                disabled={!newSubjectName.trim() || addSubject.isPending}
              >
                {addSubject.isPending ? 'Adding...' : 'Add Subject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {subjects.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <BookOpen className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No Subjects Yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              Add your first subject to get started
            </p>
            <Button onClick={() => setIsAddDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Subject
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-12 w-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${subject.color}20` }}
                    >
                      <BookOpen className="h-6 w-6" style={{ color: subject.color }} />
                    </div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <Dialog open={isEditDialogOpen && editingSubject?.id === subject.id} onOpenChange={(open) => {
                    if (!open) {
                      setIsEditDialogOpen(false);
                      setEditingSubject(null);
                    }
                  }}>
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 gap-2"
                        onClick={() => openEditDialog(subject)}
                      >
                        <Edit2 className="h-4 w-4" />
                        Edit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                        <DialogDescription>
                          Update subject details
                        </DialogDescription>
                      </DialogHeader>
                      {editingSubject && (
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="edit-subject-name">Subject Name</Label>
                            <Input
                              id="edit-subject-name"
                              value={editingSubject.name}
                              onChange={(e) =>
                                setEditingSubject({ ...editingSubject, name: e.target.value })
                              }
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Choose Color</Label>
                            <div className="grid grid-cols-9 gap-2">
                              {PRESET_COLORS.map((color) => (
                                <button
                                  key={color}
                                  type="button"
                                  className={`h-10 w-10 rounded-md transition-all hover:scale-110 ${
                                    editingSubject.color === color
                                      ? 'ring-2 ring-offset-2 ring-primary'
                                      : ''
                                  }`}
                                  style={{ backgroundColor: color }}
                                  onClick={() =>
                                    setEditingSubject({ ...editingSubject, color })
                                  }
                                />
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                      <DialogFooter>
                        <Button
                          onClick={handleEditSubject}
                          disabled={!editingSubject?.name.trim() || editSubject.isPending}
                        >
                          {editSubject.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure you want to delete?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This subject and all related sessions will be permanently deleted.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleRemoveSubject(subject.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
