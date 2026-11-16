package com.mealmesh.dsa.queue;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Singly-Linked FIFO Queue implemented from scratch.
 * Strictly avoids java.util.Queue, LinkedList, ArrayDeque.
 */
public class CustomQueue<T> {
    private QueueNode<T> head;
    private QueueNode<T> tail;
    private int size;
    private final List<QueueStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public CustomQueue() {
        this.head = null;
        this.tail = null;
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

    public List<QueueStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    public void enqueue(T data) {
        QueueNode<T> newNode = new QueueNode<>(data);
        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail.setNext(newNode);
            tail = newNode;
        }
        size++;

        if (recordSteps) {
            recordedSteps.add(new QueueStep(
                recordedSteps.size() + 1,
                "ENQUEUE",
                data != null ? data.toString() : "null",
                "Enqueued '" + data + "' at tail. Current size: " + size,
                toListOfStrings()
            ));
        }
    }

    public T dequeue() {
        if (isEmpty()) {
            return null;
        }

        T removed = head.getData();
        head = head.getNext();
        size--;
        if (head == null) {
            tail = null;
        }

        if (recordSteps) {
            recordedSteps.add(new QueueStep(
                recordedSteps.size() + 1,
                "DEQUEUE",
                removed != null ? removed.toString() : "null",
                "Dequeued '" + removed + "' from head. Remaining size: " + size,
                toListOfStrings()
            ));
        }

        return removed;
    }

    public T peek() {
        if (isEmpty()) {
            return null;
        }
        return head.getData();
    }

    public List<T> toList() {
        List<T> list = new ArrayList<>();
        QueueNode<T> curr = head;
        while (curr != null) {
            list.add(curr.getData());
            curr = curr.getNext();
        }
        return list;
    }

    public List<String> toListOfStrings() {
        List<String> list = new ArrayList<>();
        QueueNode<T> curr = head;
        while (curr != null) {
            list.add(curr.getData() != null ? curr.getData().toString() : "null");
            curr = curr.getNext();
        }
        return list;
    }
}
