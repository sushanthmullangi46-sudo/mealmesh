package com.mealmesh.dsa;

import com.mealmesh.dsa.linkedlist.DoublyLinkedList;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

class DoublyLinkedListTest {

    @Test
    void addAtBothEndsKeepsOrderInBothDirections() {
        DoublyLinkedList<String> list = new DoublyLinkedList<>();
        list.addLast("B");
        list.addLast("C");
        list.addFirst("A");

        assertEquals(3, list.size());
        assertEquals(List.of("A", "B", "C"), list.toList());
        assertEquals(List.of("C", "B", "A"), list.toBackwardList());
    }

    @Test
    void removeFromHeadMiddleAndTailRelinksNeighbours() {
        DoublyLinkedList<String> list = new DoublyLinkedList<>();
        for (String s : List.of("A", "B", "C", "D")) list.addLast(s);

        assertTrue(list.remove("B"));   // middle
        assertTrue(list.remove("A"));   // head
        assertTrue(list.remove("D"));   // tail
        assertFalse(list.remove("Z"));  // not present

        assertEquals(List.of("C"), list.toList());
        assertEquals(List.of("C"), list.toBackwardList());
        assertEquals(1, list.size());
    }

    @Test
    void emptyListBehaves() {
        DoublyLinkedList<Integer> list = new DoublyLinkedList<>();
        assertTrue(list.isEmpty());
        assertFalse(list.remove(1));
        assertTrue(list.toList().isEmpty());
    }
}
