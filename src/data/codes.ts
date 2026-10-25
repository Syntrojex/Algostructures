// C++ source shown by the "See C++ code" drawer on a visualizer page.
// Every program here compiles cleanly (g++ -std=c++17 -Wall -Wextra) and prints the result the visualizer shows for its default input.

export interface CodeEntry { filename: string; code: string }

export const CODES: Record<string, CodeEntry> = {
  'prefix-sum': { filename: 'prefix_sum.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {3, 1, 4, 1, 5, 9, 2, 6};
    int n = arr.size();

    // prefix[i] = sum of the first i elements  (prefix[0] = 0)
    vector<int> prefix(n + 1, 0);
    for (int i = 0; i < n; i++)
        prefix[i + 1] = prefix[i] + arr[i];            // O(n) once

    // sum of arr[l..r] (inclusive) in O(1)
    auto rangeSum = [&](int l, int r) { return prefix[r + 1] - prefix[l]; };

    cout << "sum(2..5) = " << rangeSum(2, 5) << endl;    // 4 + 1 + 5 + 9
    cout << "sum(0..7) = " << rangeSum(0, 7) << endl;
    return 0;
}
` },
  'two-pointer': { filename: 'two_pointer.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Find two numbers in a SORTED array that add up to target.
bool twoSum(const vector<int>& arr, int target, int& a, int& b) {
    int lo = 0, hi = (int)arr.size() - 1;
    while (lo < hi) {
        int sum = arr[lo] + arr[hi];
        if (sum == target) { a = lo; b = hi; return true; }
        if (sum < target) lo++;        // need a bigger sum -> move the left pointer right
        else hi--;                     // need a smaller sum -> move the right pointer left
    }
    return false;
}

int main() {
    vector<int> arr = {1, 2, 3, 4, 6, 8, 11};
    int i, j;
    if (twoSum(arr, 11, i, j))
        cout << "arr[" << i << "] + arr[" << j << "] = " << arr[i] << " + " << arr[j] << " = 11" << endl;
    else
        cout << "no pair found" << endl;
    return 0;
}
` },
  'sliding-window': { filename: 'sliding_window.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Maximum sum of any subarray of size k — O(n) instead of O(n*k).
int maxWindowSum(const vector<int>& arr, int k) {
    int n = arr.size();
    if (k <= 0 || k > n) return 0;

    int window = 0;
    for (int i = 0; i < k; i++) window += arr[i];       // first window
    int best = window;

    for (int i = k; i < n; i++) {
        window += arr[i];          // new element enters on the right
        window -= arr[i - k];      // old element leaves on the left
        if (window > best) best = window;
    }
    return best;
}

int main() {
    vector<int> arr = {2, 1, 5, 1, 3, 2};
    cout << "max sum of 3 in a row = " << maxWindowSum(arr, 3) << endl;
    return 0;
}
` },
  'kadane-algorithm': { filename: 'kadane.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> arr = {-2, 1, -3, 4, -1, 2, 1, -5, 4};

    int best = arr[0], cur = arr[0];
    int start = 0, bestStart = 0, bestEnd = 0;

    for (int i = 1; i < (int)arr.size(); i++) {
        if (cur < 0) {             // a negative running sum only drags us down: start fresh here
            cur = arr[i];
            start = i;
        } else {
            cur += arr[i];         // otherwise keep extending the current subarray
        }
        if (cur > best) {
            best = cur;
            bestStart = start;
            bestEnd = i;
        }
    }

    cout << "max subarray sum = " << best << endl;
    cout << "from index " << bestStart << " to " << bestEnd << endl;
    return 0;
}
` },
  'binary-search': { filename: 'binary_search.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Returns the index of target in a SORTED array, or -1.
int binarySearch(const vector<int>& arr, int target) {
    int lo = 0, hi = (int)arr.size() - 1;
    while (lo <= hi) {
        int mid = lo + (hi - lo) / 2;          // avoids overflow of (lo + hi)
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) lo = mid + 1;   // target is in the right half
        else hi = mid - 1;                     // target is in the left half
    }
    return -1;
}

int main() {
    vector<int> arr = {1, 3, 5, 7, 9, 11, 13, 15, 17, 19};
    cout << "13 is at index " << binarySearch(arr, 13) << endl;
    cout << "8 is at index " << binarySearch(arr, 8) << endl;
    return 0;
}
` },
  'linear-search': { filename: 'linear_search.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int linearSearch(const vector<int>& arr, int target) {
    for (int i = 0; i < (int)arr.size(); i++)
        if (arr[i] == target) return i;       // found: stop at once
    return -1;                                // checked everything, not there
}

int main() {
    vector<int> arr = {42, 17, 8, 93, 25, 61};
    cout << "25 is at index " << linearSearch(arr, 25) << endl;
    cout << "7 is at index " << linearSearch(arr, 7) << endl;
    return 0;
}
` },
  'bubble-sort': { filename: 'bubble_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void bubbleSort(vector<int>& arr) {
    int n = arr.size();
    for (int pass = 0; pass < n - 1; pass++) {
        bool swapped = false;
        for (int i = 0; i < n - 1 - pass; i++) {
            if (arr[i] > arr[i + 1]) {
                swap(arr[i], arr[i + 1]);     // the biggest value bubbles to the end
                swapped = true;
            }
        }
        if (!swapped) break;                  // already sorted: stop early
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    bubbleSort(arr);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'selection-sort': { filename: 'selection_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void selectionSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = 0; i < n - 1; i++) {
        int minIndex = i;
        for (int j = i + 1; j < n; j++)
            if (arr[j] < arr[minIndex]) minIndex = j;   // find the smallest of the rest
        if (minIndex != i) swap(arr[i], arr[minIndex]);
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    selectionSort(arr);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'insertion-sort': { filename: 'insertion_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void insertionSort(vector<int>& arr) {
    for (int i = 1; i < (int)arr.size(); i++) {
        int key = arr[i];
        int j = i - 1;
        while (j >= 0 && arr[j] > key) {      // shift bigger elements one step right
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;                     // drop the key into its gap
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    insertionSort(arr);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'shell-sort': { filename: 'shell_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void shellSort(vector<int>& arr) {
    int n = arr.size();
    for (int gap = n / 2; gap > 0; gap /= 2) {         // shrinking gap
        for (int i = gap; i < n; i++) {                // insertion sort on elements \`gap\` apart
            int temp = arr[i];
            int j = i;
            while (j >= gap && arr[j - gap] > temp) {
                arr[j] = arr[j - gap];
                j -= gap;
            }
            arr[j] = temp;
        }
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    shellSort(arr);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'counting-sort': { filename: 'counting_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// No comparisons at all: count how often each value occurs.
void countingSort(vector<int>& arr) {
    int lo = *min_element(arr.begin(), arr.end());
    int hi = *max_element(arr.begin(), arr.end());

    vector<int> count(hi - lo + 1, 0);
    for (int x : arr) count[x - lo]++;                 // tally

    int k = 0;
    for (int v = 0; v < (int)count.size(); v++)        // write the values back in order
        for (int c = 0; c < count[v]; c++)
            arr[k++] = v + lo;
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    countingSort(arr);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'merge-sort': { filename: 'merge_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

void merge(vector<int>& arr, int lo, int mid, int hi) {
    vector<int> left(arr.begin() + lo, arr.begin() + mid + 1);
    vector<int> right(arr.begin() + mid + 1, arr.begin() + hi + 1);
    int i = 0, j = 0, k = lo;
    while (i < (int)left.size() && j < (int)right.size())
        arr[k++] = (left[i] <= right[j]) ? left[i++] : right[j++];   // <= keeps the sort stable
    while (i < (int)left.size()) arr[k++] = left[i++];
    while (j < (int)right.size()) arr[k++] = right[j++];
}

void mergeSort(vector<int>& arr, int lo, int hi) {
    if (lo >= hi) return;
    int mid = lo + (hi - lo) / 2;
    mergeSort(arr, lo, mid);          // sort the left half
    mergeSort(arr, mid + 1, hi);      // sort the right half
    merge(arr, lo, mid, hi);          // merge the two sorted halves
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    mergeSort(arr, 0, (int)arr.size() - 1);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'quick-sort': { filename: 'quick_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int partition(vector<int>& arr, int lo, int hi) {
    int pivot = arr[hi];                  // pivot = last element
    int i = lo;
    for (int j = lo; j < hi; j++)
        if (arr[j] < pivot) swap(arr[i++], arr[j]);   // smaller values go to the left side
    swap(arr[i], arr[hi]);                // pivot lands in its final place
    return i;
}

void quickSort(vector<int>& arr, int lo, int hi) {
    if (lo >= hi) return;
    int p = partition(arr, lo, hi);
    quickSort(arr, lo, p - 1);
    quickSort(arr, p + 1, hi);
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    quickSort(arr, 0, (int)arr.size() - 1);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'heap-sort': { filename: 'heap_sort.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

// Push arr[root] down until the max-heap property holds for the first \`size\` elements.
void siftDown(vector<int>& arr, int size, int root) {
    while (true) {
        int largest = root, l = 2 * root + 1, r = 2 * root + 2;
        if (l < size && arr[l] > arr[largest]) largest = l;
        if (r < size && arr[r] > arr[largest]) largest = r;
        if (largest == root) return;
        swap(arr[root], arr[largest]);
        root = largest;
    }
}

void heapSort(vector<int>& arr) {
    int n = arr.size();
    for (int i = n / 2 - 1; i >= 0; i--) siftDown(arr, n, i);   // build a max-heap
    for (int end = n - 1; end > 0; end--) {
        swap(arr[0], arr[end]);                                 // biggest goes to the back
        siftDown(arr, end, 0);                                  // repair the shrunken heap
    }
}

int main() {
    vector<int> arr = {64, 25, 12, 22, 11, 90, 3};
    heapSort(arr);
    cout << "sorted: ";
    for (int x : arr) cout << x << " ";
    cout << endl;
    return 0;
}
` },
  'bfs-dfs': { filename: 'graph_traversal.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <stack>
using namespace std;

int main() {
    // undirected graph: A=0 B=1 C=2 D=3 E=4 F=5 G=6
    int n = 7;
    vector<vector<int>> adj(n);
    vector<pair<int,int>> edges = {{0,1},{0,2},{1,3},{2,3},{1,4},{3,5},{4,6},{5,6}};
    for (auto& e : edges) { adj[e.first].push_back(e.second); adj[e.second].push_back(e.first); }
    for (auto& v : adj) sort(v.begin(), v.end());

    // BFS — a QUEUE: visit level by level
    cout << "BFS: ";
    vector<bool> seen(n, false);
    queue<int> q;
    q.push(0); seen[0] = true;                 // mark when ADDED so nothing is queued twice
    while (!q.empty()) {
        int v = q.front(); q.pop();
        cout << char('A' + v) << " ";
        for (int nb : adj[v])
            if (!seen[nb]) { seen[nb] = true; q.push(nb); }
    }
    cout << endl;

    // DFS — a STACK: dive as deep as possible first
    cout << "DFS: ";
    vector<bool> visited(n, false);
    stack<int> st;
    st.push(0);
    while (!st.empty()) {
        int v = st.top(); st.pop();
        if (visited[v]) continue;              // marked when POPPED
        visited[v] = true;
        cout << char('A' + v) << " ";
        for (int i = (int)adj[v].size() - 1; i >= 0; i--)   // reverse so the smallest neighbour is explored first
            if (!visited[adj[v][i]]) st.push(adj[v][i]);
    }
    cout << endl;
    return 0;
}
` },
  'dijkstra': { filename: 'dijkstra.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <climits>
using namespace std;

int main() {
    // weighted graph: A=0 B=1 C=2 D=3 E=4 F=5
    int n = 6;
    vector<vector<pair<int,int>>> adj(n);          // {neighbour, weight}
    auto edge = [&](int u, int v, int w) { adj[u].push_back({v, w}); adj[v].push_back({u, w}); };
    edge(0, 1, 4); edge(0, 2, 1); edge(2, 1, 2); edge(1, 3, 1); edge(3, 5, 3); edge(2, 4, 5); edge(4, 5, 1); edge(3, 4, 2);

    vector<int> dist(n, INT_MAX), parent(n, -1);
    priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;   // min-heap of {distance, node}
    dist[0] = 0;
    pq.push({0, 0});

    while (!pq.empty()) {
        auto [d, u] = pq.top(); pq.pop();
        if (d > dist[u]) continue;                 // stale entry: a shorter route was already found
        for (auto [v, w] : adj[u]) {
            if (dist[u] + w < dist[v]) {           // relax the edge
                dist[v] = dist[u] + w;
                parent[v] = u;
                pq.push({dist[v], v});
            }
        }
    }

    for (int v = 0; v < n; v++) cout << "dist(A -> " << char('A' + v) << ") = " << dist[v] << endl;

    cout << "path to F: ";
    vector<int> path;
    for (int v = 5; v != -1; v = parent[v]) path.push_back(v);
    for (int i = (int)path.size() - 1; i >= 0; i--) cout << char('A' + path[i]) << (i ? " -> " : "\\n");
    return 0;
}
` },
  'knapsack': { filename: 'knapsack.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    vector<int> wt = {1, 3, 4, 5}, val = {1, 4, 5, 7};
    int n = wt.size(), W = 7;

    // dp[i][w] = best value using the first i items with capacity w
    vector<vector<int>> dp(n + 1, vector<int>(W + 1, 0));
    for (int i = 1; i <= n; i++) {
        for (int w = 0; w <= W; w++) {
            dp[i][w] = dp[i - 1][w];                                   // skip item i
            if (wt[i - 1] <= w)                                        // or take it, if it fits
                dp[i][w] = max(dp[i][w], val[i - 1] + dp[i - 1][w - wt[i - 1]]);
        }
    }
    cout << "best value = " << dp[n][W] << endl;

    // walk back to find WHICH items were taken
    cout << "items taken:";
    for (int i = n, w = W; i >= 1; i--)
        if (dp[i][w] != dp[i - 1][w]) { cout << " " << i; w -= wt[i - 1]; }
    cout << endl;
    return 0;
}
` },
  'lcs': { filename: 'lcs.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

int main() {
    string a = "AGGTAB", b = "GXTXAYB";
    int n = a.size(), m = b.size();

    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                           ? 1 + dp[i - 1][j - 1]                     // characters match: extend the diagonal
                           : max(dp[i - 1][j], dp[i][j - 1]);         // otherwise drop one character

    cout << "LCS length = " << dp[n][m] << endl;

    string seq;                                                       // rebuild one LCS
    for (int i = n, j = m; i > 0 && j > 0; ) {
        if (a[i - 1] == b[j - 1]) { seq += a[i - 1]; i--; j--; }
        else if (dp[i - 1][j] >= dp[i][j - 1]) i--;
        else j--;
    }
    reverse(seq.begin(), seq.end());
    cout << "one LCS = " << seq << endl;
    return 0;
}
` },
  'coin-change': { filename: 'coin_change.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <climits>
using namespace std;

int main() {
    vector<int> coins = {1, 3, 4};
    int amount = 6;

    // dp[a] = fewest coins that make amount a
    vector<int> dp(amount + 1, INT_MAX);
    dp[0] = 0;
    for (int a = 1; a <= amount; a++)
        for (int c : coins)
            if (c <= a && dp[a - c] != INT_MAX)
                dp[a] = min(dp[a], 1 + dp[a - c]);

    if (dp[amount] == INT_MAX) cout << amount << " cannot be made" << endl;
    else cout << "fewest coins for " << amount << " = " << dp[amount] << endl;
    return 0;
}
` },
  'edit-distance': { filename: 'edit_distance.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <string>
using namespace std;

int main() {
    string a = "kitten", b = "sitting";
    int n = a.size(), m = b.size();

    vector<vector<int>> dp(n + 1, vector<int>(m + 1, 0));
    for (int i = 0; i <= n; i++) dp[i][0] = i;          // delete everything
    for (int j = 0; j <= m; j++) dp[0][j] = j;          // insert everything

    for (int i = 1; i <= n; i++)
        for (int j = 1; j <= m; j++)
            dp[i][j] = (a[i - 1] == b[j - 1])
                           ? dp[i - 1][j - 1]                                           // same letter: free
                           : 1 + min({dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]});   // delete / insert / replace

    cout << "edit distance = " << dp[n][m] << endl;
    return 0;
}
` },
  'stack-playground': { filename: 'stack.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Stack {
    vector<int> data;
    int capacity;
public:
    Stack(int cap = 10) : capacity(cap) {}
    bool isEmpty() const { return data.empty(); }
    bool isFull() const { return (int)data.size() == capacity; }

    void push(int x) {
        if (isFull()) { cout << "overflow: stack is full" << endl; return; }
        data.push_back(x);                       // the new element goes on TOP
    }
    void pop() {
        if (isEmpty()) { cout << "underflow: stack is empty" << endl; return; }
        cout << "popped " << data.back() << endl;
        data.pop_back();                         // remove from the TOP
    }
    int peek() const { return data.back(); }     // look at the top without removing it
};

int main() {
    Stack s(3);
    s.pop();            // underflow
    s.push(10); s.push(20); s.push(30);
    s.push(40);         // overflow
    cout << "top = " << s.peek() << endl;
    s.pop(); s.pop(); s.pop();
    return 0;
}
` },
  'queue-playground': { filename: 'queue.cpp', code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

class Queue {
    vector<int> data;
    int front = 0, count = 0, capacity;
public:
    Queue(int cap = 10) : data(cap), capacity(cap) {}
    bool isEmpty() const { return count == 0; }
    bool isFull() const { return count == capacity; }

    void enqueue(int x) {
        if (isFull()) { cout << "overflow: queue is full" << endl; return; }
        data[(front + count) % capacity] = x;    // join at the BACK (circular buffer)
        count++;
    }
    void dequeue() {
        if (isEmpty()) { cout << "underflow: queue is empty" << endl; return; }
        cout << "dequeued " << data[front] << endl;
        front = (front + 1) % capacity;          // leave from the FRONT
        count--;
    }
    int peek() const { return data[front]; }
};

int main() {
    Queue q(3);
    q.dequeue();        // underflow
    q.enqueue(10); q.enqueue(20); q.enqueue(30);
    q.enqueue(40);      // overflow
    cout << "front = " << q.peek() << endl;
    q.dequeue(); q.dequeue(); q.dequeue();
    return 0;
}
` },
  'parentheses-checker': { filename: 'balanced_parentheses.cpp', code: `#include <iostream>
#include <stack>
#include <string>
using namespace std;

bool isBalanced(const string& text) {
    stack<char> st;
    for (char ch : text) {
        if (ch == '(' || ch == '[' || ch == '{') {
            st.push(ch);                           // opening bracket: remember it
        }
        else if (ch == ')' || ch == ']' || ch == '}') {
            if (st.empty()) return false;          // check 1: is there anything to match?
            char top = st.top();
            bool match = (ch == ')' && top == '(') ||
                         (ch == ']' && top == '[') ||
                         (ch == '}' && top == '{');
            if (!match) return false;              // check 2: does the top match this closer?
            st.pop();                              // pair closed
        }
        // any other character is ignored
    }
    return st.empty();                             // anything still open is unbalanced
}

int main() {
    string tests[] = {"{[()]}", "((", "([)]", "a+(b*c)"};
    for (const string& t : tests)
        cout << t << " -> " << (isBalanced(t) ? "balanced" : "NOT balanced") << endl;
    return 0;
}
` },
  'infix-postfix': { filename: 'infix_to_postfix.cpp', code: `#include <iostream>
#include <stack>
#include <string>
#include <cctype>
using namespace std;

int precedence(char op) {
    if (op == '^') return 3;
    if (op == '*' || op == '/') return 2;
    if (op == '+' || op == '-') return 1;
    return 0;
}

string toPostfix(const string& infix) {
    string out;
    stack<char> st;
    for (char ch : infix) {
        if (isalnum(ch)) {
            out += ch;                                   // operand: straight to the output
        }
        else if (ch == '(') {
            st.push(ch);
        }
        else if (ch == ')') {
            while (!st.empty() && st.top() != '(') { out += st.top(); st.pop(); }
            st.pop();                                    // discard the '('
        }
        else {                                           // operator
            while (!st.empty() && st.top() != '(' &&
                   (precedence(st.top()) > precedence(ch) ||
                    (precedence(st.top()) == precedence(ch) && ch != '^')))   // '^' is right-associative
            {
                out += st.top();
                st.pop();
            }
            st.push(ch);
        }
    }
    while (!st.empty()) { out += st.top(); st.pop(); }   // flush what is left
    return out;
}

int main() {
    string tests[] = {"a+b*c", "(a+b)*c", "a^b^c", "a-b-c", "a*(b+c)/d"};
    for (const string& t : tests)
        cout << t << " -> " << toPostfix(t) << endl;
    return 0;
}
` },
  'n-queens': { filename: 'n_queens.cpp', code: `#include <iostream>
#include <vector>
#include <cstdlib>
using namespace std;

bool isSafe(const vector<int>& col, int row, int c) {
    for (int r = 0; r < row; r++) {
        if (col[r] == c) return false;                       // same column
        if (abs(col[r] - c) == row - r) return false;        // same diagonal
    }
    return true;
}

bool solve(vector<int>& col, int row, int n) {
    if (row == n) return true;                               // every row has a queen
    for (int c = 0; c < n; c++) {
        if (isSafe(col, row, c)) {
            col[row] = c;                                    // place the queen
            if (solve(col, row + 1, n)) return true;
            col[row] = -1;                                   // dead end -> BACKTRACK
        }
    }
    return false;
}

int main() {
    int n = 6;
    vector<int> col(n, -1);                                  // col[r] = column of the queen in row r
    if (!solve(col, 0, n)) { cout << "no solution" << endl; return 0; }
    for (int r = 0; r < n; r++) {
        for (int c = 0; c < n; c++) cout << (col[r] == c ? "Q " : ". ");
        cout << endl;
    }
    return 0;
}
` },
  'tower-hanoi': { filename: 'tower_of_hanoi.cpp', code: `#include <iostream>
using namespace std;

int moves = 0;

// Move n disks from \`from\` to \`to\`, using \`via\` as the helper peg.
void hanoi(int n, char from, char to, char via) {
    if (n == 0) return;                                       // nothing to move
    hanoi(n - 1, from, via, to);                              // 1) clear the top n-1 disks out of the way
    cout << "Move disk " << n << " from " << from << " to " << to << endl;   // 2) move the biggest one
    moves++;
    hanoi(n - 1, via, to, from);                              // 3) put the n-1 disks back on top
}

int main() {
    int n = 3;
    hanoi(n, 'A', 'C', 'B');
    cout << "total moves = " << moves << " (2^" << n << " - 1)" << endl;
    return 0;
}
` },
  'bit-operators': { filename: 'bitwise_operators.cpp', code: `#include <iostream>
#include <bitset>
using namespace std;

int main() {
    unsigned char a = 12, b = 10;                      // 00001100 and 00001010
    cout << "A       = " << bitset<8>(a) << " (" << (int)a << ")" << endl;
    cout << "B       = " << bitset<8>(b) << " (" << (int)b << ")" << endl;
    cout << "A & B   = " << bitset<8>(a & b) << "   both bits 1" << endl;
    cout << "A | B   = " << bitset<8>(a | b) << "   at least one bit 1" << endl;
    cout << "A ^ B   = " << bitset<8>(a ^ b) << "   bits differ" << endl;
    cout << "~A      = " << bitset<8>((unsigned char)~a) << "   every bit flipped" << endl;
    return 0;
}
` },
  'bit-tricks': { filename: 'bit_tricks.cpp', code: `#include <iostream>
#include <bitset>
using namespace std;

int countSetBits(unsigned int x) {
    int count = 0;
    while (x) {
        x &= (x - 1);        // clears the lowest set bit each time
        count++;
    }
    return count;
}

int main() {
    unsigned char a = 12;                                    // 00001100
    cout << "A << 2        = " << bitset<8>(a << 2) << endl;   // multiply by 4
    cout << "A >> 2        = " << bitset<8>(a >> 2) << endl;   // divide by 4
    cout << "set bit 0     = " << bitset<8>(a | (1 << 0)) << endl;
    cout << "clear bit 2   = " << bitset<8>(a & ~(1 << 2)) << endl;
    cout << "toggle bit 3  = " << bitset<8>(a ^ (1 << 3)) << endl;
    cout << "bits set in A = " << countSetBits(a) << endl;
    return 0;
}
` },
};
