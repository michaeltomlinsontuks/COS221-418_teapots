/**
 * CompareIt API Tester - Batch Testing Controller
 * Handles functionality specific to the Batch Testing tab
 */

const BatchTestingController = (function() {
    // DOM elements
    let DOM = {};

    // Current state
    let state = {
        batchTests: [],
        currentRunIndex: -1,
        isRunning: false
    };

    // Storage key for batch tests
    const STORAGE_KEY = 'compareIt_batchTests';

    // Initialize DOM references
    const initializeDOMReferences = function() {
        DOM = {
            createBatchTestBtn: document.getElementById('createNewBatchTest'),
            runAllBatchTestsBtn: document.getElementById('runAllBatchTests'),
            clearAllBatchTestsBtn: document.getElementById('clearAllBatchTests'),
            batchTestsContainer: document.getElementById('batchTestsContainer')
        };
    };

    // Load batch tests from localStorage
    const loadBatchTests = function() {
        const savedTests = localStorage.getItem(STORAGE_KEY);
        if (savedTests) {
            state.batchTests = JSON.parse(savedTests);
            updateBatchTestsUI();
        }
    };

    // Save batch tests to localStorage
    const saveBatchTests = function() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.batchTests));
    };

    // Create a new batch test
    const createBatchTest = function() {
        // Get test suites for selection
        const testSuites = TestSuitesController.getTestSuites();

        if (testSuites.length === 0) {
            alert('Please create at least one test suite in the Test Suites tab before creating a batch test.');
            UIController.selectTab('test-suites');
            return;
        }

        // Create new batch test object
        const newBatchTest = {
            id: Date.now(),
            name: 'Batch Test ' + (state.batchTests.length + 1),
            testCases: [],
            results: null
        };

        // Add to state
        state.batchTests.push(newBatchTest);
        saveBatchTests();

        // Update UI
        updateBatchTestsUI();

        // Show test suite selection for this batch
        showTestSuiteSelection(newBatchTest.id);
    };

    // Show test suite selection dialog for adding tests to a batch
    const showTestSuiteSelection = function(batchId) {
        const batch = state.batchTests.find(b => b.id === batchId);
        if (!batch) return;

        const testSuites = TestSuitesController.getTestSuites();

        // Create modal for test selection
        const modalHTML = `
            <div class="modal fade" id="batchTestModal" tabindex="-1" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">Add Tests to ${batch.name}</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="mb-3">
                                <label class="form-label">Select Test Suite:</label>
                                <select class="form-select" id="batchTestSuiteSelect">
                                    ${testSuites.map(suite => `<option value="${suite.id}">${suite.name}</option>`).join('')}
                                </select>
                            </div>
                            <div class="mb-3" id="batchTestCasesContainer">
                                <label class="form-label">Select Test Cases:</label>
                                <div class="list-group" id="batchTestCasesList">
                                    <div class="alert alert-info">
                                        Select a test suite to view available test cases
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" class="btn btn-primary" id="addToBatchBtn">Add Selected Tests</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer);

        // Initialize modal
        const modal = new bootstrap.Modal(document.getElementById('batchTestModal'));
        modal.show();

        // Handle test suite selection
        const suiteSelect = document.getElementById('batchTestSuiteSelect');
        suiteSelect.addEventListener('change', function() {
            const suiteId = parseInt(suiteSelect.value);
            const suite = testSuites.find(s => s.id === suiteId);

            if (suite && suite.testCases.length > 0) {
                // Show test cases for this suite
                const testCasesList = document.getElementById('batchTestCasesList');
                testCasesList.innerHTML = '';

                suite.testCases.forEach(testCase => {
                    const testCaseItem = document.createElement('div');
                    testCaseItem.className = 'list-group-item';
                    testCaseItem.innerHTML = `
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${testCase.id}" id="testCase-${testCase.id}">
                            <label class="form-check-label" for="testCase-${testCase.id}">
                                ${testCase.name || testCase.request.type} - ${testCase.expectedOutcome}
                            </label>
                        </div>
                    `;
                    testCasesList.appendChild(testCaseItem);
                });
            } else {
                document.getElementById('batchTestCasesList').innerHTML = '<div class="alert alert-warning">No test cases available in this suite</div>';
            }
        });

        // Trigger initial load of test cases
        suiteSelect.dispatchEvent(new Event('change'));

        // Handle add to batch button
        document.getElementById('addToBatchBtn').addEventListener('click', function() {
            const suiteId = parseInt(suiteSelect.value);
            const suite = testSuites.find(s => s.id === suiteId);
            const selectedTestCases = [];

            // Get all selected test cases
            const checkboxes = document.querySelectorAll('#batchTestCasesList input[type="checkbox"]:checked');
            checkboxes.forEach(checkbox => {
                const testCaseId = parseInt(checkbox.value);
                const testCase = suite.testCases.find(tc => tc.id === testCaseId);
                if (testCase) {
                    selectedTestCases.push({
                        id: Date.now() + selectedTestCases.length, // Generate unique ID
                        suiteId: suite.id,
                        suiteName: suite.name,
                        testCaseId: testCase.id,
                        name: testCase.name || testCase.request.type,
                        request: testCase.request,
                        expectedOutcome: testCase.expectedOutcome,
                        matchCriteria: testCase.matchCriteria,
                        status: 'pending' // pending, pass, fail
                    });
                }
            });

            if (selectedTestCases.length > 0) {
                // Add selected test cases to batch
                batch.testCases = batch.testCases.concat(selectedTestCases);
                saveBatchTests();
                updateBatchTestsUI();
            }

            modal.hide();

            // Clean up
            setTimeout(() => {
                document.body.removeChild(modalContainer);
            }, 500);
        });
    };

    // Update batch tests UI
    const updateBatchTestsUI = function() {
        // Clear current UI
        DOM.batchTestsContainer.innerHTML = '';

        if (state.batchTests.length === 0) {
            DOM.batchTestsContainer.innerHTML = `
                <div class="alert alert-info">
                    <i class="bi bi-info-circle"></i> Create a new batch test or add tests from the Single Request tab using "Save to Test Suite"
                </div>
            `;
            return;
        }

        // Create UI for each batch test
        state.batchTests.forEach(batchTest => {
            const batchTestEl = document.createElement('div');
            batchTestEl.className = 'card mb-3 batch-test';
            batchTestEl.dataset.batchId = batchTest.id;

            // Determine status indicator
            let resultsSummary = '';
            if (batchTest.results) {
                const passed = batchTest.results.filter(r => r.status === 'pass').length;
                const total = batchTest.results.length;
                resultsSummary = `<span class="badge bg-${passed === total ? 'success' : 'warning'}">${passed}/${total} passed</span>`;
            }

            batchTestEl.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h3 class="h6 mb-0">${batchTest.name}</h3>
                    <div>
                        ${resultsSummary}
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary run-batch" data-batch-id="${batchTest.id}">
                                <i class="bi bi-play-fill"></i> Run
                            </button>
                            <button class="btn btn-outline-secondary add-tests" data-batch-id="${batchTest.id}">
                                <i class="bi bi-plus"></i> Add Tests
                            </button>
                            <button class="btn btn-outline-danger remove-batch" data-batch-id="${batchTest.id}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    ${batchTest.testCases.length > 0 ? renderTestCasesList(batchTest) : '<div class="alert alert-warning">No test cases added to this batch yet</div>'}
                </div>
            `;

            DOM.batchTestsContainer.appendChild(batchTestEl);
        });

        // Add event listeners
        addBatchTestEventListeners();
    };

    // Render test cases list for a batch
    const renderTestCasesList = function(batchTest) {
        let html = `<div class="table-responsive"><table class="table table-sm">
            <thead>
                <tr>
                    <th>Test Case</th>
                    <th>Suite</th>
                    <th>Endpoint</th>
                    <th>Expected</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>`;

        batchTest.testCases.forEach(testCase => {
            // Determine status indicator
            let statusIndicator = '';
            if (testCase.status === 'pass') {
                statusIndicator = '<span class="badge bg-success">Pass</span>';
            } else if (testCase.status === 'fail') {
                statusIndicator = '<span class="badge bg-danger">Fail</span>';
            } else {
                statusIndicator = '<span class="badge bg-secondary">Pending</span>';
            }

            html += `
                <tr data-test-id="${testCase.id}">
                    <td>${testCase.name}</td>
                    <td>${testCase.suiteName}</td>
                    <td>${testCase.request.type}</td>
                    <td>${testCase.expectedOutcome}</td>
                    <td>${statusIndicator}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-secondary run-test" data-batch-id="${batchTest.id}" data-test-id="${testCase.id}">
                            <i class="bi bi-play-fill"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger remove-test" data-batch-id="${batchTest.id}" data-test-id="${testCase.id}">
                            <i class="bi bi-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        html += '</tbody></table></div>';
        return html;
    };

    // Add event listeners to batch test elements
    const addBatchTestEventListeners = function() {
        // Run batch button
        document.querySelectorAll('.run-batch').forEach(btn => {
            btn.addEventListener('click', function() {
                const batchId = parseInt(this.dataset.batchId);
                runBatchTest(batchId);
            });
        });

        // Add tests button
        document.querySelectorAll('.add-tests').forEach(btn => {
            btn.addEventListener('click', function() {
                const batchId = parseInt(this.dataset.batchId);
                showTestSuiteSelection(batchId);
            });
        });

        // Remove batch button
        document.querySelectorAll('.remove-batch').forEach(btn => {
            btn.addEventListener('click', function() {
                const batchId = parseInt(this.dataset.batchId);
                removeBatchTest(batchId);
            });
        });

        // Run individual test button
        document.querySelectorAll('.run-test').forEach(btn => {
            btn.addEventListener('click', function() {
                const batchId = parseInt(this.dataset.batchId);
                const testId = parseInt(this.dataset.testId);
                runSingleTest(batchId, testId);
            });
        });

        // Remove test button
        document.querySelectorAll('.remove-test').forEach(btn => {
            btn.addEventListener('click', function() {
                const batchId = parseInt(this.dataset.batchId);
                const testId = parseInt(this.dataset.testId);
                removeTestFromBatch(batchId, testId);
            });
        });
    };

    // Run a single test from a batch
    const runSingleTest = function(batchId, testId) {
        const batch = state.batchTests.find(b => b.id === batchId);
        if (!batch) return;

        const testCase = batch.testCases.find(t => t.id === testId);
        if (!testCase) return;

        // Set status to pending
        testCase.status = 'pending';
        updateBatchTestsUI();

        // Run the test
        executeTest(testCase).then(() => {
            // Update UI with results
            updateBatchTestsUI();
            saveBatchTests();
        });
    };

    // Run an entire batch test
    const runBatchTest = function(batchId) {
        if (state.isRunning) {
            alert('A batch test is already running');
            return;
        }

        const batch = state.batchTests.find(b => b.id === batchId);
        if (!batch || batch.testCases.length === 0) return;

        // Reset all test statuses
        batch.testCases.forEach(testCase => {
            testCase.status = 'pending';
        });

        // Clear previous results
        batch.results = null;

        // Update UI to show pending status
        updateBatchTestsUI();

        // Set running state
        state.isRunning = true;
        state.currentRunIndex = 0;

        // Get first test case
        const firstTest = batch.testCases[0];

        // Run first test, which will chain to the next
        executeTest(firstTest).then(() => {
            runNextInBatch(batchId);
        });
    };

    // Run next test in a batch
    const runNextInBatch = function(batchId) {
        const batch = state.batchTests.find(b => b.id === batchId);
        if (!batch) {
            state.isRunning = false;
            return;
        }

        state.currentRunIndex++;

        // If we've run all tests, complete the batch
        if (state.currentRunIndex >= batch.testCases.length) {
            completeBatchRun(batch);
            return;
        }

        // Get the next test case
        const nextTest = batch.testCases[state.currentRunIndex];

        // Update UI to show progress
        updateBatchTestsUI();

        // Run the next test
        executeTest(nextTest).then(() => {
            runNextInBatch(batchId);
        });
    };

    // Complete a batch test run
    const completeBatchRun = function(batch) {
        // Set running state to false
        state.isRunning = false;
        state.currentRunIndex = -1;

        // Collect results
        batch.results = batch.testCases.map(test => ({
            id: test.id,
            name: test.name,
            status: test.status,
            message: test.resultMessage || ''
        }));

        // Save results
        saveBatchTests();

        // Update UI
        updateBatchTestsUI();
    };

    // Run all batch tests sequentially
    const runAllBatchTests = function() {
        if (state.isRunning) {
            alert('A batch test is already running');
            return;
        }

        if (state.batchTests.length === 0) {
            alert('No batch tests available');
            return;
        }

        // Reset all test statuses
        state.batchTests.forEach(batch => {
            batch.testCases.forEach(testCase => {
                testCase.status = 'pending';
            });
            batch.results = null;
        });

        // Update UI to show pending status
        updateBatchTestsUI();

        // Run each batch sequentially
        let currentBatchIndex = 0;

        const runNextBatch = function() {
            if (currentBatchIndex >= state.batchTests.length) {
                // All batches completed
                return;
            }

            runBatchTest(state.batchTests[currentBatchIndex].id);

            // Set up watcher to check when current batch is done
            const watchInterval = setInterval(() => {
                if (!state.isRunning) {
                    clearInterval(watchInterval);
                    currentBatchIndex++;
                    runNextBatch();
                }
            }, 500);
        };

        runNextBatch();
    };

    // Execute a single test and evaluate the result
    const executeTest = function(testCase) {
        return new Promise(resolve => {
            // Make API request
            fetch(UIController.getApiUrl(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(testCase.request)
            })
                .then(response => response.json())
                .then(data => {
                    // Evaluate result based on expectedOutcome
                    evaluateTestResult(testCase, data);
                })
                .catch(error => {
                    // Connection error
                    testCase.status = 'fail';
                    testCase.resultMessage = 'Connection error: ' + error.message;
                })
                .finally(() => {
                    resolve();
                });
        });
    };

    // Evaluate a test result
    const evaluateTestResult = function(testCase, responseData) {
        // Store response for reference
        testCase.response = responseData;

        // Evaluate based on expected outcome
        switch (testCase.expectedOutcome) {
            case 'success':
                if (responseData.status === 'success') {
                    testCase.status = 'pass';
                    testCase.resultMessage = 'Response matched success status';
                } else {
                    testCase.status = 'fail';
                    testCase.resultMessage = 'Expected success but got: ' + responseData.status;
                }
                break;

            case 'error':
                if (responseData.status === 'error') {
                    testCase.status = 'pass';
                    testCase.resultMessage = 'Response matched error status';
                } else {
                    testCase.status = 'fail';
                    testCase.resultMessage = 'Expected error but got: ' + responseData.status;
                }
                break;

            case 'specific':
                // For specific field matching
                if (!testCase.matchCriteria || testCase.matchCriteria.length === 0) {
                    testCase.status = 'fail';
                    testCase.resultMessage = 'No match criteria specified';
                    break;
                }

                let allMatches = true;
                const mismatches = [];

                // Check each field in the match criteria
                testCase.matchCriteria.forEach(criteria => {
                    const fieldValue = getNestedValue(responseData, criteria.path);

                    // Try to convert to same type for comparison
                    let expectedValue = criteria.value;
                    if (!isNaN(expectedValue) && !isNaN(parseFloat(expectedValue))) {
                        expectedValue = parseFloat(expectedValue);
                    }

                    if (fieldValue === undefined) {
                        allMatches = false;
                        mismatches.push(`Field ${criteria.path} not found in response`);
                    } else if (fieldValue != expectedValue) { // Using loose comparison for string/number compatibility
                        allMatches = false;
                        mismatches.push(`Field ${criteria.path}: expected ${expectedValue}, got ${fieldValue}`);
                    }
                });

                if (allMatches) {
                    testCase.status = 'pass';
                    testCase.resultMessage = 'All specified fields matched';
                } else {
                    testCase.status = 'fail';
                    testCase.resultMessage = mismatches.join('; ');
                }
                break;

            default:
                testCase.status = 'fail';
                testCase.resultMessage = 'Unknown expected outcome: ' + testCase.expectedOutcome;
        }
    };

    // Get a nested value from an object using a path string
    const getNestedValue = function(obj, path) {
        const keys = path.split('.');
        let value = obj;

        for (const key of keys) {
            if (value === null || typeof value !== 'object') {
                return undefined;
            }

            // Handle array indices in path (e.g., "data.0.name")
            if (!isNaN(key) && Array.isArray(value)) {
                value = value[parseInt(key)];
            } else {
                value = value[key];
            }

            if (value === undefined) {
                return undefined;
            }
        }

        return value;
    };

    // Remove a batch test
    const removeBatchTest = function(batchId) {
        if (confirm('Are you sure you want to remove this batch test?')) {
            state.batchTests = state.batchTests.filter(b => b.id !== batchId);
            saveBatchTests();
            updateBatchTestsUI();
        }
    };

    // Remove a test from a batch
    const removeTestFromBatch = function(batchId, testId) {
        const batch = state.batchTests.find(b => b.id === batchId);
        if (!batch) return;

        batch.testCases = batch.testCases.filter(t => t.id !== testId);

        // Also update results if they exist
        if (batch.results) {
            batch.results = batch.results.filter(r => r.id !== testId);
        }

        saveBatchTests();
        updateBatchTestsUI();
    };

    // Clear all batch tests
    const clearAllBatchTests = function() {
        if (confirm('Are you sure you want to clear all batch tests?')) {
            state.batchTests = [];
            saveBatchTests();
            updateBatchTestsUI();
        }
    };

    // Initialize event listeners
    const initializeEventListeners = function() {
        DOM.createBatchTestBtn.addEventListener('click', createBatchTest);
        DOM.runAllBatchTestsBtn.addEventListener('click', runAllBatchTests);
        DOM.clearAllBatchTestsBtn.addEventListener('click', clearAllBatchTests);
    };

    // Public interface
    return {
        init: function() {
            // Initialize DOM references
            initializeDOMReferences();

            // Initialize event listeners
            initializeEventListeners();

            // Load saved batch tests
            loadBatchTests();

            console.log('Batch Testing Controller initialized');
        }
    };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    BatchTestingController.init();
});