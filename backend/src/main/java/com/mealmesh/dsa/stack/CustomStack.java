package com.mealmesh.dsa.stack;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Singly-Linked LIFO Stack implemented from scratch.
 * Strictly avoids java.util.Stack and java.util.Deque.
 * Used for reversible administrative operations (undo action stack).
 */
public class CustomStack<T> {
    private StackNode<T> top;
    private int size;
    private final List<StackStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public CustomStack() {
        this.top = null;
        this.size = 0;
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

    public List<StackStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    public void push(T data) {
        StackNode<T> newNode = new StackNode<>(data, top);
        top = newNode;
        size++;

        if (recordSteps) {
            recordedSteps.add(new StackStep(
                recordedSteps.size() + 1,
                "PUSH",
                data != null ? data.toString() : "null",
                "Pushed '" + data + "' onto top of stack. Current size: " + size,
                toListOfStrings()
            ));
        }
    }

    public T pop() {
        if (isEmpty()) {
            return null;
        }

        T removed = top.getData();
        top = top.getNext();
        size--;

        if (recordSteps) {
            recordedSteps.add(new StackStep(
                recordedSteps.size() + 1,
                "POP",
                removed != null ? removed.toString() : "null",
                "Popped '" + removed + "' from stack. Remaining size: " + size,
                toListOfStrings()
            ));
        }

        return removed;
    }

    public T peek() {
        if (isEmpty()) {
            return null;
        }
        return top.getData();
    }

    public List<T> toList() {
        List<T> list = new ArrayList<>();
        StackNode<T> curr = top;
        while (curr != null) {
            list.add(curr.getData());
            curr = curr.getNext();
        }
        return list;
    }

    public List<String> toListOfStrings() {
        List<String> list = new ArrayList<>();
        StackNode<T> curr = top;
        while (curr != null) {
            list.add(curr.getData() != null ? curr.getData().toString() : "null");
            curr = curr.getNext();
        }
        return list;
    }
}
