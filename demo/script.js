// Attempt to import from the dist directory
// Note: This assumes formula.js is an ES module.
// If not, this will need to be adjusted (e.g. using a global variable if the lib exports to one)
import { formulaEval, defaultFunctions } from '../dist/formula.js';

document.addEventListener('DOMContentLoaded', () => {
    const formulaInput = document.getElementById('formulaInput');
    const evaluateButton = document.getElementById('evaluateButton');
    const resultArea = document.getElementById('resultArea');
    const functionsList = document.getElementById('functionsList');

    // Display available functions
    if (functionsList && defaultFunctions) {
        Object.keys(defaultFunctions).forEach(funcName => {
            const listItem = document.createElement('li');
            listItem.textContent = funcName;
            functionsList.appendChild(listItem);
        });
    } else {
        if (!functionsList) console.error('Functions list element not found');
        if (!defaultFunctions) console.error('defaultFunctions not available');
    }

    // Evaluate formula on button click
    if (evaluateButton && formulaInput && resultArea) {
        evaluateButton.addEventListener('click', () => {
            const formula = formulaInput.value;
            try {
                const result = formulaEval(formula, {}, { functions: defaultFunctions });
                if (typeof result === 'object' || Array.isArray(result)) {
                    resultArea.textContent = JSON.stringify(result, null, 2);
                } else {
                    resultArea.textContent = result;
                }
            } catch (error) {
                resultArea.textContent = `Error: ${error.message}`;
            }
        });
    } else {
        if (!evaluateButton) console.error('Evaluate button not found');
        if (!formulaInput) console.error('Formula input not found');
        if (!resultArea) console.error('Result area not found');
    }
});
