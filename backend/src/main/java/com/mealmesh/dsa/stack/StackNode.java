package com.mealmesh.dsa.stack;

public class StackNode<T> {
    private final T data;
    private StackNode<T> next;

    public StackNode(T data, StackNode<T> next) {
        this.data = data;
        this.next = next;
    }

    public T getData() {
        return data;
    }

    public StackNode<T> getNext() {
        return next;
    }

    public void setNext(StackNode<T> next) {
        this.next = next;
    }
}
