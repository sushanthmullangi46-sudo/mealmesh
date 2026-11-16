package com.mealmesh.dsa;

import com.mealmesh.dsa.queue.CustomQueue;
import com.mealmesh.dsa.stack.CustomStack;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class CustomStackQueueTest {

    @Test
    void testCustomQueueFifo() {
        CustomQueue<String> queue = new CustomQueue<>();
        queue.enqueue("First");
        queue.enqueue("Second");
        queue.enqueue("Third");

        assertEquals(3, queue.size());
        assertEquals("First", queue.peek());
        assertEquals("First", queue.dequeue());
        assertEquals("Second", queue.dequeue());
        assertEquals("Third", queue.dequeue());
        assertNull(queue.dequeue());
        assertTrue(queue.isEmpty());
    }

    @Test
    void testCustomStackLifo() {
        CustomStack<String> stack = new CustomStack<>();
        stack.push("Base");
        stack.push("Middle");
        stack.push("Top");

        assertEquals(3, stack.size());
        assertEquals("Top", stack.peek());
        assertEquals("Top", stack.pop());
        assertEquals("Middle", stack.pop());
        assertEquals("Base", stack.pop());
        assertNull(stack.pop());
        assertTrue(stack.isEmpty());
    }
}
