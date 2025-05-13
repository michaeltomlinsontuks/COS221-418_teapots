/**
 * CompareIt API Tester - Main Controller
 * This file coordinates the initialization of all sub-controllers and handles shared functionality
 */

// Main UI Controller
const UIController = (function() {
    // Shared state for the application
    let state = {
        apiUrl: 'http://localhost/api.php',
        defaultApiKey: '',
        history: [],
        selectedTab: 'single-test',
        darkMode: false
    };

    // DOM elements
    let DOM = {};

    // Storage keys
    const STORAGE_KEYS = {
        API_URL: 'compareIt_apiUrl',
        API_KEY: 'compareIt_defaultApiKey',
        HISTORY: 'compareIt_requestHistory',
        DARK_MODE: 'compareIt_darkMode'
    };

    // Initialize DOM references
    const initializeDOMReferences = function() {
        DOM = {
            // Settings
            apiUrlInput: document.getElementById('apiUrl'),
            defaultApiKeyInput: document.getElementById('defaultApiKey'),

            // Tabs
            mainTabs: document.getElementById('mainTabs'),
            historyCount: document.getElementById('historyCount'),

            // Global UI elements
            spinner: document.getElementById('spinner')
        };
    };

    // Initialize event listeners
    const initializeEventListeners = function() {
        // API URL and default key change
        DOM.apiUrlInput.addEventListener('change', function() {
            saveApiUrl(this.value);
        });

        DOM.defaultApiKeyInput.addEventListener('change', function() {
            saveDefaultApiKey(this.value);
        });

        // Tab change events
        const tabElements = document.querySelectorAll('[data-bs-toggle="tab"]');
        tabElements.forEach(tab => {
            tab.addEventListener('shown.bs.tab', function(event) {
                state.selectedTab = event.target.getAttribute('data-bs-target').substring(1);
            });
        });
    };

    // Load saved settings from localStorage
    const loadSettings = function() {
        // Load API URL
        const savedApiUrl = localStorage.getItem(STORAGE_KEYS.API_URL);
        if (savedApiUrl) {
            state.apiUrl = savedApiUrl;
            DOM.apiUrlInput.value = savedApiUrl;
        }

        // Load default API key
        const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        if (savedApiKey) {
            state.defaultApiKey = savedApiKey;
            DOM.defaultApiKeyInput.value = savedApiKey;
        }

        // Load request history
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        if (savedHistory) {
            state.history = JSON.parse(savedHistory);
            updateHistoryCount();
        }
    };

    // Save API URL
    const saveApiUrl = function(url) {
        state.apiUrl = url;
        localStorage.setItem(STORAGE_KEYS.API_URL, url);
    };

    // Save default API key
    const saveDefaultApiKey = function(key) {
        state.defaultApiKey = key;
        localStorage.setItem(STORAGE_KEYS.API_KEY, key);
    };

    // Add to request history
    const addToHistory = function(request, response) {
        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            request: request,
            response: response
        };

        // Add to front of array (most recent first)
        state.history.unshift(historyItem);

        // Limit history to 50 items
        if (state.history.length > 50) {
            state.history = state.history.slice(0, 50);
        }

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(state.history));

        // Update UI
        updateHistoryCount();
    };

    // Update the history count badge
    const updateHistoryCount = function() {
        if (DOM.historyCount) {
            DOM.historyCount.textContent = state.history.length;
        }
    };

    // Select a specific tab programmatically
    const selectTab = function(tabId) {
        const tabElement = document.querySelector(`[data-bs-target="#${tabId}"]`);
        if (tabElement) {
            const tab = new bootstrap.Tab(tabElement);
            tab.show();
        }
    };

    // Show or hide the loading spinner
    const toggleSpinner = function(show) {
        if (DOM.spinner) {
            DOM.spinner.style.display = show ? 'inline-block' : 'none';
        }
    };

    // Public methods
    return {
        init: function() {
            console.log('Initializing UI Controller');

            // Initialize DOM references
            initializeDOMReferences();

            // Load saved settings
            loadSettings();

            // Initialize event listeners
            initializeEventListeners();

            // Hide the spinner initially
            toggleSpinner(false);
        },

        // Getters
        getApiUrl: function() {
            return state.apiUrl || 'api.php';
        },

        getDefaultApiKey: function() {
            return state.defaultApiKey;
        },

        getHistory: function() {
            return state.history;
        },

        displayResponse: function(data) {
            const responseStatus = document.getElementById('responseStatus');
            const responseStatusContainer = document.getElementById('responseStatusContainer');

            // Show the status container
            responseStatusContainer.style.display = 'block';

            // Set status style based on response
            if (data.status === 'success') {
                responseStatus.className = 'response-status status-success';
                responseStatus.textContent = 'Success';
            } else {
                responseStatus.className = 'response-status status-error';
                responseStatus.textContent = 'Error: ' + data.message;
            }
        },

        // Add to history and expose for other controllers
        addToHistory: addToHistory,

        // UI manipulation
        selectTab: selectTab,
        toggleSpinner: toggleSpinner
    };
})();

// Test Suites Controller - shared functionality for test suites
const TestSuitesController = (function() {
    // Current test suites
    let testSuites = [];

    // Storage key
    const STORAGE_KEY = 'compareIt_testSuites';

    // Load test suites from localStorage
    const loadTestSuites = function() {
        const savedSuites = localStorage.getItem(STORAGE_KEY);
        if (savedSuites) {
            testSuites = JSON.parse(savedSuites);
        }
    };

    // Create a new test suite
    const createTestSuite = function(name) {
        const newSuite = {
            id: Date.now(),
            name: name,
            testCases: []
        };

        testSuites.push(newSuite);
        saveSuites();

        return newSuite;
    };

    // Add a test case to a suite
    const addTestCase = function(suiteId, testCase) {
        const suite = testSuites.find(s => s.id === suiteId);
        if (!suite) return false;

        // Add ID to test case if not present
        if (!testCase.id) {
            testCase.id = Date.now();
        }

        suite.testCases.push(testCase);
        saveSuites();

        return true;
    };

    // Save suites to localStorage
    const saveSuites = function() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(testSuites));
    };

    // Export test suites to JSON string
    const exportTestSuites = function() {
        return JSON.stringify(testSuites, null, 2);
    };

    // Import test suites from JSON string
    const importTestSuites = function(jsonStr) {
        try {
            const imported = JSON.parse(jsonStr);

            // Basic validation
            if (!Array.isArray(imported)) {
                return false;
            }

            // Check each suite has required properties
            const valid = imported.every(suite =>
                typeof suite === 'object' &&
                suite !== null &&
                suite.hasOwnProperty('id') &&
                suite.hasOwnProperty('name') &&
                Array.isArray(suite.testCases)
            );

            if (!valid) {
                return false;
            }

            // Update test suites and save
            testSuites = imported;
            saveSuites();

            return true;
        } catch (e) {
            console.error('Error importing test suites:', e);
            return false;
        }
    };

    return {
        init: function() {
            loadTestSuites();
            console.log('Test Suites Controller initialized');
        },

        getTestSuites: function() {
            return testSuites;
        },

        createTestSuite: createTestSuite,
        addTestCase: addTestCase,
        exportTestSuites: exportTestSuites,
        importTestSuites: importTestSuites
    };
})();

// Initialize all controllers when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize main UI controller first
    UIController.init();

    // Initialize shared controllers
    TestSuitesController.init();

    // Other controllers are initialized in their respective files

    console.log('CompareIt API Tester initialized');
});