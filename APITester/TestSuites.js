/**
 * CompareIt API Tester - Test Suites Controller
 * Handles functionality specific to the Test Suites tab
 */

const TestSuitesUIController = (function() {
    // DOM elements
    let DOM = {};

    // Current state
    let state = {
        selectedSuiteId: null,
        runningTests: false
    };

    // Initialize DOM references
    const initializeDOMReferences = function() {
        DOM = {
            // Test Suite Creation
            testSuiteName: document.getElementById('testSuiteName'),
            createTestSuiteBtn: document.getElementById('createTestSuite'),

            // Test Suite List
            testSuitesList: document.getElementById('testSuitesList'),

            // Test Cases Container
            testCasesContainer: document.getElementById('testCasesContainer'),

            // Import/Export
            exportTestSuitesBtn: document.getElementById('exportTestSuites'),
            importTestSuitesBtn: document.getElementById('importTestSuites'),
            importTestSuitesFile: document.getElementById('importTestSuitesFile')
        };
    };

    // Initialize event listeners
    const initializeEventListeners = function() {
        // Create new test suite
        DOM.createTestSuiteBtn.addEventListener('click', createTestSuite);

        // Export test suites
        DOM.exportTestSuitesBtn.addEventListener('click', exportTestSuites);

        // Import test suites
        DOM.importTestSuitesBtn.addEventListener('click', function() {
            DOM.importTestSuitesFile.click();
        });

        DOM.importTestSuitesFile.addEventListener('change', importTestSuites);
    };

    // Create a new test suite
    const createTestSuite = function() {
        const suiteName = DOM.testSuiteName.value.trim();

        if (!suiteName) {
            alert('Please enter a name for the test suite');
            return;
        }

        // Create the test suite using the controller from UIScripts.js
        const newSuite = TestSuitesController.createTestSuite(suiteName);

        // Update UI
        updateTestSuitesList();

        // Clear input
        DOM.testSuiteName.value = '';

        // Select the new suite
        selectTestSuite(newSuite.id);
    };

    // Update the test suites list in the UI
    const updateTestSuitesList = function() {
        const testSuites = TestSuitesController.getTestSuites();

        // Clear current list
        DOM.testSuitesList.innerHTML = '';

        if (testSuites.length === 0) {
            DOM.testSuitesList.innerHTML = '<li class="list-group-item text-center text-muted">No test suites available</li>';
            return;
        }

        // Add each test suite to the list
        testSuites.forEach(suite => {
            const item = document.createElement('li');
            item.className = 'list-group-item d-flex justify-content-between align-items-center';
            if (state.selectedSuiteId === suite.id) {
                item.classList.add('active');
            }

            item.innerHTML = `
                <div>
                    <span class="suite-name">${suite.name}</span>
                    <span class="badge bg-primary">${suite.testCases.length}</span>
                </div>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary run-suite" data-suite-id="${suite.id}">
                        <i class="bi bi-play-fill"></i>
                    </button>
                    <button class="btn btn-outline-danger delete-suite" data-suite-id="${suite.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;

            // Add click event to select this suite
            item.querySelector('.suite-name').addEventListener('click', function() {
                selectTestSuite(suite.id);
            });

            // Add run button event
            item.querySelector('.run-suite').addEventListener('click', function() {
                runTestSuite(suite.id);
            });

            // Add delete button event
            item.querySelector('.delete-suite').addEventListener('click', function() {
                deleteTestSuite(suite.id);
            });

            DOM.testSuitesList.appendChild(item);
        });

        // Also update the select dropdown in the test suite modal
        updateTestSuiteDropdown();
    };

    // Select a test suite and display its test cases
    const selectTestSuite = function(suiteId) {
        state.selectedSuiteId = suiteId;

        // Highlight selected suite in list
        updateTestSuitesList();

        // Display test cases for this suite
        displayTestCases(suiteId);
    };

    // Display test cases for a selected suite
    const displayTestCases = function(suiteId) {
        const testSuites = TestSuitesController.getTestSuites();
        const suite = testSuites.find(s => s.id === suiteId);

        if (!suite) {
            DOM.testCasesContainer.innerHTML = `
                <div class="alert alert-info">
                    Select a test suite to view its test cases
                </div>
            `;
            return;
        }

        // Clear current container
        DOM.testCasesContainer.innerHTML = '';

        // Add suite header
        const suiteHeader = document.createElement('div');
        suiteHeader.className = 'mb-3 d-flex justify-content-between align-items-center';
        suiteHeader.innerHTML = `
            <h4>${suite.name}</h4>
            <button class="btn btn-primary run-all-tests">
                <i class="bi bi-play-fill"></i> Run All Tests
            </button>
        `;

        // Add run all tests event
        suiteHeader.querySelector('.run-all-tests').addEventListener('click', function() {
            runTestSuite(suiteId);
        });

        DOM.testCasesContainer.appendChild(suiteHeader);

        // If no test cases, show message
        if (suite.testCases.length === 0) {
            const noTestsMsg = document.createElement('div');
            noTestsMsg.className = 'alert alert-info';
            noTestsMsg.textContent = 'No test cases in this suite. Add test cases from the Single Request tab.';
            DOM.testCasesContainer.appendChild(noTestsMsg);
            return;
        }

        // Add each test case
        suite.testCases.forEach((testCase, index) => {
            const testCaseElement = document.createElement('div');
            testCaseElement.className = 'card mb-3 test-case';
            testCaseElement.dataset.testId = testCase.id;

            testCaseElement.innerHTML = `
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${testCase.name}</h5>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary run-test" title="Run Test">
                            <i class="bi bi-play-fill"></i>
                        </button>
                        <button class="btn btn-outline-danger delete-test" title="Delete Test">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="row">
                        <div class="col-md-6">
                            <h6>Request</h6>
                            <pre class="response-container">${JSON.stringify(testCase.request, null, 2)}</pre>
                        </div>
                        <div class="col-md-6">
                            <h6>Expected Result</h6>
                            <p><strong>Outcome: </strong>${testCase.expectedOutcome}</p>
                            ${testCase.matchCriteria ? `
                                <div class="match-criteria">
                                    <h6>Match Criteria</h6>
                                    <ul class="list-group">
                                        ${testCase.matchCriteria.map(c => `
                                            <li class="list-group-item">
                                                <strong>${c.path}</strong>: ${c.value}
                                            </li>
                                        `).join('')}
                                    </ul>
                                </div>
                            ` : ''}
                            <div class="test-result mt-3" style="display:none;"></div>
                        </div>
                    </div>
                </div>
            `;

            // Add run test event
            testCaseElement.querySelector('.run-test').addEventListener('click', function() {
                runTestCase(suite.id, testCase.id);
            });

            // Add delete test event
            testCaseElement.querySelector('.delete-test').addEventListener('click', function() {
                deleteTestCase(suite.id, testCase.id);
            });

            DOM.testCasesContainer.appendChild(testCaseElement);
        });
    };

    // Run a single test case
    const runTestCase = function(suiteId, testCaseId) {
        const testSuites = TestSuitesController.getTestSuites();
        const suite = testSuites.find(s => s.id === suiteId);

        if (!suite) return;

        const testCase = suite.testCases.find(t => t.id === testCaseId);
        if (!testCase) return;

        const testElement = DOM.testCasesContainer.querySelector(`.test-case[data-test-id="${testCaseId}"]`);
        const resultElement = testElement.querySelector('.test-result');

        // Show loading
        resultElement.style.display = 'block';
        resultElement.innerHTML = '<div class="alert alert-info">Running test...</div>';

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
                // Verify result against expected outcome
                let passed = false;
                let resultMessage = '';

                if (testCase.expectedOutcome === 'success') {
                    passed = data.status === 'success';
                    resultMessage = passed ? 'Success response as expected' : 'Expected success but got error';
                } else if (testCase.expectedOutcome === 'error') {
                    passed = data.status === 'error';
                    resultMessage = passed ? 'Error response as expected' : 'Expected error but got success';
                } else if (testCase.expectedOutcome === 'specific' && testCase.matchCriteria) {
                    // Check each criteria
                    passed = true;
                    for (const criteria of testCase.matchCriteria) {
                        const value = getNestedValue(data, criteria.path);
                        if (value !== criteria.value) {
                            passed = false;
                            resultMessage = `Field ${criteria.path} has value "${value}" but expected "${criteria.value}"`;
                            break;
                        }
                    }
                    if (passed) {
                        resultMessage = 'All field criteria matched';
                    }
                }

                // Display result
                resultElement.innerHTML = `
                    <div class="alert ${passed ? 'alert-success' : 'alert-danger'}">
                        <strong>${passed ? 'PASSED' : 'FAILED'}</strong>: ${resultMessage}
                    </div>
                    <div>
                        <strong>Response:</strong>
                        <pre class="response-container">${JSON.stringify(data, null, 2)}</pre>
                    </div>
                `;
            })
            .catch(error => {
                resultElement.innerHTML = `
                    <div class="alert alert-danger">
                        <strong>ERROR</strong>: ${error.message}
                    </div>
                `;
            });
    };

    // Helper function to get nested value from an object using a path string
    const getNestedValue = function(obj, path) {
        const parts = path.split('.');
        let value = obj;

        for (const part of parts) {
            if (value === null || value === undefined || typeof value !== 'object') {
                return undefined;
            }
            value = value[part];
        }

        return value;
    };

    // Run all tests in a suite
    const runTestSuite = function(suiteId) {
        const testSuites = TestSuitesController.getTestSuites();
        const suite = testSuites.find(s => s.id === suiteId);

        if (!suite || suite.testCases.length === 0) {
            alert('No test cases to run in this suite');
            return;
        }

        // Get all test case IDs in this suite
        const testCaseIds = suite.testCases.map(t => t.id);

        // Run each test in sequence
        let currentIndex = 0;

        const runNextTest = function() {
            if (currentIndex < testCaseIds.length) {
                runTestCase(suiteId, testCaseIds[currentIndex]);
                currentIndex++;
                setTimeout(runNextTest, 1000); // Add small delay between tests
            }
        };

        // Start running tests
        runNextTest();
    };

    // Delete a test suite
    const deleteTestSuite = function(suiteId) {
        if (!confirm('Are you sure you want to delete this test suite?')) {
            return;
        }

        const testSuites = TestSuitesController.getTestSuites();
        const updatedSuites = testSuites.filter(s => s.id !== suiteId);

        // Update storage
        localStorage.setItem('compareIt_testSuites', JSON.stringify(updatedSuites));

        // If this was the selected suite, reset selection
        if (state.selectedSuiteId === suiteId) {
            state.selectedSuiteId = null;
            DOM.testCasesContainer.innerHTML = `
                <div class="alert alert-info">
                    Select a test suite to view its test cases
                </div>
            `;
        }

        // Update UI
        updateTestSuitesList();
    };

    // Delete a test case
    const deleteTestCase = function(suiteId, testCaseId) {
        if (!confirm('Are you sure you want to delete this test case?')) {
            return;
        }

        const testSuites = TestSuitesController.getTestSuites();
        const suiteIndex = testSuites.findIndex(s => s.id === suiteId);

        if (suiteIndex >= 0) {
            // Filter out the deleted test case
            testSuites[suiteIndex].testCases = testSuites[suiteIndex].testCases.filter(t => t.id !== testCaseId);

            // Update storage
            localStorage.setItem('compareIt_testSuites', JSON.stringify(testSuites));

            // Update UI
            displayTestCases(suiteId);
            updateTestSuitesList(); // Update count badge
        }
    };

    // Update the test suite dropdown in the modal
    const updateTestSuiteDropdown = function() {
        const selectElement = document.getElementById('selectTestSuite');
        if (!selectElement) return;

        const testSuites = TestSuitesController.getTestSuites();

        // Clear current options
        selectElement.innerHTML = '';

        if (testSuites.length === 0) {
            selectElement.innerHTML = '<option>No test suites available</option>';
            return;
        }

        // Add each test suite as an option
        testSuites.forEach(suite => {
            const option = document.createElement('option');
            option.value = suite.id;
            option.textContent = suite.name;
            selectElement.appendChild(option);
        });
    };

    // Export test suites
    const exportTestSuites = function() {
        const testSuites = TestSuitesController.getTestSuites();

        if (testSuites.length === 0) {
            alert('No test suites to export');
            return;
        }

        const dataStr = TestSuitesController.exportTestSuites();
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

        const exportFileDefaultName = 'compareIt_test_suites.json';

        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    };

    // Import test suites
    const importTestSuites = function(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const contents = e.target.result;

            try {
                const success = TestSuitesController.importTestSuites(contents);

                if (success) {
                    alert('Test suites imported successfully');
                    updateTestSuitesList();
                } else {
                    alert('Failed to import test suites: Invalid format');
                }
            } catch (error) {
                alert('Failed to import test suites: ' + error.message);
            }

            // Reset file input
            event.target.value = '';
        };

        reader.readAsText(file);
    };

    // Public interface
    return {
        init: function() {
            initializeDOMReferences();
            initializeEventListeners();
            updateTestSuitesList();
            console.log('Test Suites UI Controller initialized');
        }
    };
})();

// Initialize when document is ready
document.addEventListener('DOMContentLoaded', function() {
    TestSuitesUIController.init();
});