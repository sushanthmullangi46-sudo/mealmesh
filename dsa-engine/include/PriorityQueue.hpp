#pragma once

#include <vector>
#include <utility>
#include <stdexcept>
#include <algorithm>
#include <cstddef>

namespace dsa {

/**
 * Custom Min-Heap Priority Queue implemented from scratch.
 * Guarantees O(log N) insertion and extraction, O(1) peek.
 * Supports taking snapshots for algorithm visualization.
 */
template <typename Element, typename Priority = double>
class PriorityQueue {
public:
    struct Item {
        Element element;
        Priority priority;

        bool operator>(const Item& other) const {
            return priority > other.priority;
        }
        bool operator<(const Item& other) const {
            return priority < other.priority;
        }
    };

private:
    std::vector<Item> heap_;

    void siftUp(size_t index) {
        while (index > 0) {
            size_t parent = (index - 1) / 2;
            if (heap_[index].priority < heap_[parent].priority) {
                std::swap(heap_[index], heap_[parent]);
                index = parent;
            } else {
                break;
            }
        }
    }

    void siftDown(size_t index) {
        size_t size = heap_.size();
        while (true) {
            size_t smallest = index;
            size_t left = 2 * index + 1;
            size_t right = 2 * index + 2;

            if (left < size && heap_[left].priority < heap_[smallest].priority) {
                smallest = left;
            }
            if (right < size && heap_[right].priority < heap_[smallest].priority) {
                smallest = right;
            }

            if (smallest != index) {
                std::swap(heap_[index], heap_[smallest]);
                index = smallest;
            } else {
                break;
            }
        }
    }

public:
    PriorityQueue() = default;

    void push(const Element& element, Priority priority) {
        heap_.push_back({element, priority});
        siftUp(heap_.size() - 1);
    }

    void pop() {
        if (heap_.empty()) {
            throw std::out_of_range("Priority queue underflow: pop called on empty heap");
        }
        heap_[0] = std::move(heap_.back());
        heap_.pop_back();
        if (!heap_.empty()) {
            siftDown(0);
        }
    }

    [[nodiscard]] const Item& top() const {
        if (heap_.empty()) {
            throw std::out_of_range("Priority queue is empty");
        }
        return heap_[0];
    }

    [[nodiscard]] bool empty() const noexcept {
        return heap_.empty();
    }

    [[nodiscard]] size_t size() const noexcept {
        return heap_.size();
    }

    void clear() noexcept {
        heap_.clear();
    }

    // Export top elements for step-by-step visual inspection
    [[nodiscard]] std::vector<std::pair<Element, Priority>> getTopK(size_t k = 10) const {
        std::vector<Item> copy = heap_;
        std::sort(copy.begin(), copy.end(), [](const Item& a, const Item& b) {
            return a.priority < b.priority;
        });

        std::vector<std::pair<Element, Priority>> result;
        size_t limit = std::min(k, copy.size());
        result.reserve(limit);
        for (size_t i = 0; i < limit; ++i) {
            result.emplace_back(copy[i].element, copy[i].priority);
        }
        return result;
    }
};

} // namespace dsa
