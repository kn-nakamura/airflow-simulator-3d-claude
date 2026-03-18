import { create } from 'zustand';
import type { SceneObject, TransformMode, ShapeType } from '../types';

interface UndoEntry {
  objects: SceneObject[];
}

interface ObjectState {
  objects: SceneObject[];
  selectedId: string | null;
  selectedIds: string[];
  transformMode: TransformMode;
  undoStack: UndoEntry[];
  redoStack: UndoEntry[];
  addObject: (shape: ShapeType) => void;
  removeObject: (id: string) => void;
  updateObject: (id: string, updates: Partial<SceneObject>) => void;
  selectObject: (id: string | null, multi?: boolean) => void;
  setTransformMode: (mode: TransformMode) => void;
  duplicateObject: (id: string) => void;
  setObjects: (objects: SceneObject[]) => void;
  undo: () => void;
  redo: () => void;
  pushUndo: () => void;
}

let nextId = 1;
const genId = () => `obj_${nextId++}`;

const shapeNames: Record<ShapeType, string> = {
  box: 'Box',
  sphere: 'Sphere',
  cylinder: 'Cylinder',
  cone: 'Cone',
  torus: 'Torus',
};

const shapeColors: Record<ShapeType, string> = {
  box: '#6366f1',
  sphere: '#38bdf8',
  cylinder: '#f59e0b',
  cone: '#10b981',
  torus: '#ec4899',
};

export const useObjectStore = create<ObjectState>((set, get) => ({
  objects: [],
  selectedId: null,
  selectedIds: [],
  transformMode: 'translate',
  undoStack: [],
  redoStack: [],

  pushUndo: () => {
    const { objects, undoStack } = get();
    set({
      undoStack: [...undoStack.slice(-50), { objects: JSON.parse(JSON.stringify(objects)) }],
      redoStack: [],
    });
  },

  addObject: (shape) => {
    const state = get();
    state.pushUndo();
    const id = genId();
    const obj: SceneObject = {
      id,
      name: `${shapeNames[shape]} ${nextId - 1}`,
      shape,
      position: [0, shape === 'box' ? 0.5 : 1, 0],
      rotation: [0, 0, 0],
      scale: [1, 1, 1],
      roughness: 0.5,
      visible: true,
      locked: false,
      color: shapeColors[shape],
    };
    set({ objects: [...state.objects, obj], selectedId: id, selectedIds: [id] });
  },

  removeObject: (id) => {
    const state = get();
    state.pushUndo();
    set({
      objects: state.objects.filter((o) => o.id !== id),
      selectedId: state.selectedId === id ? null : state.selectedId,
      selectedIds: state.selectedIds.filter((sid) => sid !== id),
    });
  },

  updateObject: (id, updates) => {
    set((s) => ({
      objects: s.objects.map((o) => (o.id === id ? { ...o, ...updates } : o)),
    }));
  },

  selectObject: (id, multi = false) => {
    if (!id) {
      set({ selectedId: null, selectedIds: [] });
      return;
    }
    if (multi) {
      set((s) => {
        const ids = s.selectedIds.includes(id)
          ? s.selectedIds.filter((sid) => sid !== id)
          : [...s.selectedIds, id];
        return { selectedId: ids[ids.length - 1] || null, selectedIds: ids };
      });
    } else {
      set({ selectedId: id, selectedIds: [id] });
    }
  },

  setTransformMode: (mode) => set({ transformMode: mode }),

  duplicateObject: (id) => {
    const state = get();
    const obj = state.objects.find((o) => o.id === id);
    if (!obj) return;
    state.pushUndo();
    const newId = genId();
    const copy: SceneObject = {
      ...JSON.parse(JSON.stringify(obj)),
      id: newId,
      name: `${obj.name} Copy`,
      position: [obj.position[0] + 1, obj.position[1], obj.position[2] + 1],
    };
    set({ objects: [...state.objects, copy], selectedId: newId, selectedIds: [newId] });
  },

  setObjects: (objects) => {
    get().pushUndo();
    set({ objects, selectedId: null, selectedIds: [] });
  },

  undo: () => {
    const { undoStack, objects } = get();
    if (undoStack.length === 0) return;
    const prev = undoStack[undoStack.length - 1];
    set({
      undoStack: undoStack.slice(0, -1),
      redoStack: [...get().redoStack, { objects: JSON.parse(JSON.stringify(objects)) }],
      objects: prev.objects,
    });
  },

  redo: () => {
    const { redoStack, objects } = get();
    if (redoStack.length === 0) return;
    const next = redoStack[redoStack.length - 1];
    set({
      redoStack: redoStack.slice(0, -1),
      undoStack: [...get().undoStack, { objects: JSON.parse(JSON.stringify(objects)) }],
      objects: next.objects,
    });
  },
}));
