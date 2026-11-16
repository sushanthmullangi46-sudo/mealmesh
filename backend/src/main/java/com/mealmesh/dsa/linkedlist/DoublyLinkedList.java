package com.mealmesh.dsa.linkedlist;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom Doubly Linked List implemented completely from scratch.
 * Strictly avoids java.util.LinkedList.
 * Supports bidirectional traversal and step tracking for timeline navigation.
 */
public class DoublyLinkedList<T> {
    private DoublyNode<T> head;
    private DoublyNode<T> tail;
    private int size;
    private final List<LinkedListStep> recordedSteps = new ArrayList<>();
    private boolean recordSteps = true;

    public DoublyLinkedList() {
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

    public List<LinkedListStep> getRecordedSteps() {
        return new ArrayList<>(recordedSteps);
    }

    public void setRecordSteps(boolean recordSteps) {
        this.recordSteps = recordSteps;
    }

    public void addFirst(T data) {
        DoublyNode<T> newNode = new DoublyNode<>(data);
        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            newNode.setNext(head);
            head.setPrev(newNode);
            head = newNode;
        }
        size++;

        if (recordSteps) {
            recordedSteps.add(new LinkedListStep(
                recordedSteps.size() + 1,
                "ADD_FIRST",
                data != null ? data.toString() : "null",
                "Prepended node '" + data + "' to head. List length: " + size,
                toForwardList()
            ));
        }
    }

    public void addLast(T data) {
        DoublyNode<T> newNode = new DoublyNode<>(data);
        if (isEmpty()) {
            head = newNode;
            tail = newNode;
        } else {
            tail.setNext(newNode);
            newNode.setPrev(tail);
            tail = newNode;
        }
        size++;

        if (recordSteps) {
            recordedSteps.add(new LinkedListStep(
                recordedSteps.size() + 1,
                "ADD_LAST",
                data != null ? data.toString() : "null",
                "Appended node '" + data + "' to tail. List length: " + size,
                toForwardList()
            ));
        }
    }

    public boolean remove(T data) {
        if (isEmpty() || data == null) return false;

        DoublyNode<T> curr = head;
        while (curr != null) {
            if (data.equals(curr.getData())) {
                if (curr.getPrev() != null) {
                    curr.getPrev().setNext(curr.getNext());
                } else {
                    head = curr.getNext();
                }

                if (curr.getNext() != null) {
                    curr.getNext().setPrev(curr.getPrev());
                } else {
                    tail = curr.getPrev();
                }

                size--;

                if (recordSteps) {
                    recordedSteps.add(new LinkedListStep(
                        recordedSteps.size() + 1,
                        "REMOVE",
                        data.toString(),
                        "Unlinked node '" + data + "'. List length: " + size,
                        toForwardList()
                    ));
                }
                return true;
            }
            curr = curr.getNext();
        }
        return false;
    }

    public List<String> toForwardList() {
        List<String> list = new ArrayList<>();
        DoublyNode<T> curr = head;
        while (curr != null) {
            list.add(curr.getData() != null ? curr.getData().toString() : "null");
            curr = curr.getNext();
        }
        return list;
    }

    public List<String> toBackwardList() {
        List<String> list = new ArrayList<>();
        DoublyNode<T> curr = tail;
        while (curr != null) {
            list.add(curr.getData() != null ? curr.getData().toString() : "null");
            curr = curr.getPrev();
        }
        return list;
    }

    public List<T> toList() {
        List<T> list = new ArrayList<>();
        DoublyNode<T> curr = head;
        while (curr != null) {
            list.add(curr.getData());
            curr = curr.getNext();
        }
        return list;
    }
}
