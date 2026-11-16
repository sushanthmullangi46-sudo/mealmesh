package com.mealmesh.dsa.heap;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Binary Min-Heap implemented from scratch using primitive arrays.
 * Strictly avoids java.util.PriorityQueue.
 * Supports priority updates and step recording for interactive DSA visualizations.
 */
public class MinHeap<T> {
    private static final int DEFAULT_CAPACITY = 32;
    @SuppressWarnings("unchecked")
    private HeapItem<T>[] heap = new HeapItem[DEFAULT_CAPACITY];
    private int size = 0;
    private final List<HeapStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public MinHeap() {
    }

    public MinHeap(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    public int size() {
        return size;
    }

    public boolean isEmpty() {
        return size == 0;
    }

    public void clearSteps() {
        recordedSteps.clear();
    }

    public List<HeapStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    public void insert(HeapItem<T> item) {
        ensureCapacity();
        int index = size;
        heap[index] = item;
        size++;

        if (recordSteps) {
            recordedSteps.add(new HeapStep(
                recordedSteps.size() + 1,
                "INSERT",
                "Inserted item '" + item.getLabel() + "' with priority " + item.getPriorityKey() + " at index " + index,
                index,
                -1,
                takeSnapshot()
            ));
        }

        heapifyUp(index);
    }

    public HeapItem<T> peek() {
        if (isEmpty()) {
            return null;
        }
        return heap[0];
    }

    public HeapItem<T> extractMin() {
        if (isEmpty()) {
            return null;
        }

        HeapItem<T> min = heap[0];
        HeapItem<T> last = heap[size - 1];
        heap[0] = last;
        heap[size - 1] = null;
        size--;

        if (recordSteps) {
            recordedSteps.add(new HeapStep(
                recordedSteps.size() + 1,
                "EXTRACT_MIN",
                "Extracted minimum item '" + min.getLabel() + "' (priority " + min.getPriorityKey() + "). Moved last item to root.",
                0,
                size,
                takeSnapshot()
            ));
        }

        if (size > 0) {
            heapifyDown(0);
        }

        return min;
    }

    public boolean updatePriority(String id, double newPriority) {
        int index = findIndexById(id);
        if (index == -1) return false;

        double oldPriority = heap[index].getPriorityKey();
        heap[index].setPriorityKey(newPriority);

        if (recordSteps) {
            recordedSteps.add(new HeapStep(
                recordedSteps.size() + 1,
                "UPDATE_PRIORITY",
                "Updated priority of '" + heap[index].getLabel() + "' from " + oldPriority + " to " + newPriority,
                index,
                -1,
                takeSnapshot()
            ));
        }

        if (newPriority < oldPriority) {
            heapifyUp(index);
        } else {
            heapifyDown(index);
        }
        return true;
    }

    public boolean remove(String id) {
        int index = findIndexById(id);
        if (index == -1) return false;

        HeapItem<T> item = heap[index];
        HeapItem<T> last = heap[size - 1];
        heap[index] = last;
        heap[size - 1] = null;
        size--;

        if (recordSteps) {
            recordedSteps.add(new HeapStep(
                recordedSteps.size() + 1,
                "REMOVE",
                "Removed '" + item.getLabel() + "' from heap. Replaced with last element.",
                index,
                size,
                takeSnapshot()
            ));
        }

        if (index < size) {
            heapifyUp(index);
            heapifyDown(index);
        }
        return true;
    }

    private void heapifyUp(int index) {
        while (index > 0) {
            int parentIdx = (index - 1) / 2;
            if (heap[index].getPriorityKey() < heap[parentIdx].getPriorityKey()) {
                if (recordSteps) {
                    recordedSteps.add(new HeapStep(
                        recordedSteps.size() + 1,
                        "HEAPIFY_UP_COMPARE",
                        "Child index " + index + " (" + heap[index].getPriorityKey() + ") < Parent index " + parentIdx + " (" + heap[parentIdx].getPriorityKey() + ") -> Swapping",
                        index,
                        parentIdx,
                        takeSnapshot()
                    ));
                }
                swap(index, parentIdx);
                index = parentIdx;
            } else {
                break;
            }
        }
    }

    private void heapifyDown(int index) {
        while (index < size) {
            int leftIdx = 2 * index + 1;
            int rightIdx = 2 * index + 2;
            int smallest = index;

            if (leftIdx < size && heap[leftIdx].getPriorityKey() < heap[smallest].getPriorityKey()) {
                smallest = leftIdx;
            }
            if (rightIdx < size && heap[rightIdx].getPriorityKey() < heap[smallest].getPriorityKey()) {
                smallest = rightIdx;
            }

            if (smallest != index) {
                if (recordSteps) {
                    recordedSteps.add(new HeapStep(
                        recordedSteps.size() + 1,
                        "HEAPIFY_DOWN_COMPARE",
                        "Parent index " + index + " (" + heap[index].getPriorityKey() + ") > Child index " + smallest + " (" + heap[smallest].getPriorityKey() + ") -> Swapping",
                        index,
                        smallest,
                        takeSnapshot()
                    ));
                }
                swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }

    private void swap(int i, int j) {
        HeapItem<T> temp = heap[i];
        heap[i] = heap[j];
        heap[j] = temp;
    }

    private int findIndexById(String id) {
        for (int i = 0; i < size; i++) {
            if (heap[i] != null && heap[i].getId().equals(id)) {
                return i;
            }
        }
        return -1;
    }

    @SuppressWarnings("unchecked")
    private void ensureCapacity() {
        if (size >= heap.length) {
            HeapItem<T>[] newArr = new HeapItem[heap.length * 2];
            System.arraycopy(heap, 0, newArr, 0, heap.length);
            heap = newArr;
        }
    }

    public List<HeapStep.HeapItemSnapshot> takeSnapshot() {
        List<HeapStep.HeapItemSnapshot> snapshot = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            HeapItem<T> it = heap[i];
            if (it != null) {
                snapshot.add(new HeapStep.HeapItemSnapshot(it.getId(), it.getPriorityKey(), it.getLabel(), it.getUrgency()));
            }
        }
        return snapshot;
    }

    public List<HeapItem<T>> toList() {
        List<HeapItem<T>> list = new ArrayList<>();
        for (int i = 0; i < size; i++) {
            list.add(heap[i]);
        }
        return list;
    }
}
