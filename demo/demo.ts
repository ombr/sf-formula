import { formulaEval } from 'sf-formula';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
const demoVariables = {
    x: 10,
    y: 5,
    name: "John",
    isActive: true,
    PI: Math.PI,
    firstName: "John",
    lastName: "Doe",
    age: 30,
    balance: 1500.75
};

// Demo functionality
class FormulaDemo {
    private resultDiv: HTMLElement;
    private editorView!: EditorView;
    private inputContainer: HTMLElement;

    constructor() {
        this.resultDiv = document.getElementById('result') as HTMLElement;
        this.inputContainer = document.getElementById('formulaInputContainer') as HTMLElement;
        
        this.initializeCodeMirror();
        this.evaluateFormula();
    }

    private initializeCodeMirror(): void {
        const startState = EditorState.create({
            doc: 'x + y',
            extensions: [
                basicSetup,
                EditorView.updateListener.of((update) => {
                    if (update.docChanged) {
                        const formula = this.editorView.state.doc.toString().trim();
                        if (formula) {
                            this.evaluateFormula();
                        }
                    }
                })
            ]
        });

        this.editorView = new EditorView({
            state: startState,
            parent: this.inputContainer
        });
    }

    evaluateFormula(): void {
        const formula = this.editorView.state.doc.toString();
        try {
            // Create a context with demo variables
            const result = formulaEval(formula, demoVariables);
            this.showResult(formula, result);
        } catch (error) {
            this.showError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    loadExample(example: string): void {
        // Replace the entire document content
        this.editorView.dispatch({
            changes: {
                from: 0,
                to: this.editorView.state.doc.length,
                insert: example
            }
        });
        
        this.editorView.focus();
        this.evaluateFormula();
    }

    private showResult(formula: string, result: any): void {
        const resultType = typeof result;
        const displayResult = this.formatResult(result);
        
        this.resultDiv.innerHTML = `
            <div class="result">
                <strong>Formula:</strong> <code>${this.escapeHtml(formula)}</code><br>
                <strong>Result:</strong> <code>${this.escapeHtml(displayResult)}</code><br>
                <strong>Type:</strong> <span style="color: #666; font-size: 0.9em;">${resultType}</span>
            </div>
        `;
    }

    private showError(message: string): void {
        this.resultDiv.innerHTML = `
            <div class="error">
                ${this.escapeHtml(message)}
            </div>
        `;
    }

    private formatResult(result: any): string {
        if (typeof result === 'string') {
            return `"${result}"`;
        } else if (typeof result === 'number') {
            // Format numbers nicely
            return Number.isInteger(result) ? result.toString() : result.toFixed(6).replace(/\.?0+$/, '');
        } else if (typeof result === 'boolean') {
            return result ? 'TRUE' : 'FALSE';
        } else if (result === null) {
            return 'NULL';
        } else if (result === undefined) {
            return 'UNDEFINED';
        } else {
            return String(result);
        }
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global variables and functions that the HTML expects
let demoInstance: FormulaDemo;

// Global function for the HTML button
function evaluateFormula(): void {
    if (demoInstance) {
        demoInstance.evaluateFormula();
    }
}

// Global function for example buttons
function loadExample(example: string): void {
    if (demoInstance) {
        demoInstance.loadExample(example);
    }
}

// Make functions available globally
(window as any).evaluateFormula = evaluateFormula;
(window as any).loadExample = loadExample;

// Initialize the demo when the page loads
document.addEventListener('DOMContentLoaded', () => {
    demoInstance = new FormulaDemo();
});