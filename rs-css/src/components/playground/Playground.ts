import { BaseComponent } from '../abstract/base-component';
import { Editor } from './editor/Editor';
import { Viewer } from './viewer/Viewer';
import { Table } from './table/Table';
import { observer } from '../../common/observer';
import { LevelObject } from '../../data/levelsData';
import { Button } from '../abstract/button/button';
import { AnimationName } from '../../app';
import './playground.css';

type ElementPair = {
    tableElement: HTMLElement;
    viewerElement: HTMLElement;
};

export class Playground extends BaseComponent {
    private table: Table;
    private editor: Editor;
    private viewer: Viewer;
    private editorWrapper: HTMLElement;
    private task: HTMLHeadingElement;
    private levelNum: number;
    private levelData: LevelObject;
    private helpButton: HTMLButtonElement;
    constructor(parent: HTMLElement, levelData: LevelObject, levelNum: number) {
        super({ parent, className: 'playground-container' });
        this.levelData = levelData;
        this.levelNum = levelNum;
        this.task = new BaseComponent<HTMLHeadingElement>({
            tag: 'h2',
            parent: this.element,
            content: `${levelData.task}`,
            className: 'task',
        }).element;
        this.table = new Table(
            this.element,
            this.levelData,
            this.onMouseOver.bind(this),
            this.onMouseOut.bind(this),
            this.onCompletedLevel.bind(this)
        );
        this.helpButton = new Button({
            parent: this.element,
            className: 'help-btn',
            content: 'help',
            onClick: this.handleHelpButtonClick.bind(this),
        }).element;
        this.editorWrapper = new BaseComponent({ parent: this.element, className: 'editor-wrapper' }).element;
        this.editorWrapper.addEventListener('animationend', this.removeEditorAnimation.bind(this));
        this.editor = new Editor(this.editorWrapper, this.checkGuess.bind(this));
        this.viewer = new Viewer(this.editorWrapper, levelData, this.onMouseOver.bind(this), this.onMouseOut.bind(this));
    }

    private onMouseOver(e: MouseEvent): void {
        if (e.target instanceof HTMLElement) {
            const elem: HTMLElement = e.target.closest('.viewer-window div') || e.target;

            if (elem instanceof HTMLElement) {
                const { tableElement, viewerElement }: ElementPair = this.getElements(elem);

                if (tableElement && viewerElement) {
                    tableElement.classList.add('hover');
                    viewerElement.classList.add('hover');
                    this.table.showTooltip(viewerElement, tableElement.getBoundingClientRect().left, tableElement.getBoundingClientRect().top);
                }
            }
        }
    }

    private onMouseOut(e: MouseEvent): void {
        if (e.target instanceof HTMLElement) {
            const elem: HTMLElement = e.target.closest('.viewer-window div') || e.target;

            if (elem instanceof HTMLElement) {
                const { tableElement, viewerElement }: ElementPair = this.getElements(elem);

                if (tableElement && viewerElement) {
                    tableElement.classList.remove('hover');
                    viewerElement.classList.remove('hover');
                    this.table.hideTooltip();
                }
            }
        }
    }

    private getElements(elem: HTMLElement): ElementPair {
        let ind: number;
        const viewerElements: HTMLElement[] = this.viewer.viewerElements;
        const tableElements: HTMLElement[] = this.table.tableElements;
        if (viewerElements.includes(elem)) {
            ind = viewerElements.indexOf(elem);
        } else {
            ind = tableElements.indexOf(elem);
        }

        return { tableElement: tableElements[ind], viewerElement: viewerElements[ind] };
    }

    public checkGuess(input: HTMLInputElement): void {
        try {
            const guessValue: NodeListOf<HTMLElement> = this.table.tableContainer.querySelectorAll(input.value);
            const testValue: NodeListOf<HTMLElement> = this.table.tableContainer.querySelectorAll(this.levelData.selector);

            if (testValue.length && guessValue.length === testValue.length && [...guessValue].every((elem, ind) => elem === testValue[ind])) {
                this.table.removeActiveElements([...guessValue]);
            } else if (guessValue.length) {
                this.table.addWrongItemAnimation([...guessValue]);
            } else {
                this.addEditorAnimation();
            }
        } catch (err) {
            this.addEditorAnimation();
        }
    }

    public onCompletedLevel(): void {
        observer.notify({
            levelNum: this.levelNum + 1,
            isCompleted: true,
        });
    }

    public handleHelpButtonClick(): void {
        observer.notify({ isHintUsed: true });
        this.editor.clear();
        this.editor.showAnswer(this.levelData.selector, this.helpButton);
    }

    private addEditorAnimation() {
        this.editorWrapper.classList.add(AnimationName.OnError);
    }

    private removeEditorAnimation() {
        this.editorWrapper.classList.remove(AnimationName.OnError);
    }

    public update(levelData: LevelObject, levelNum: number, isGameOver?: boolean) {
        this.editor.clear();
        this.levelData = levelData;
        this.levelNum = levelNum;
        this.task.textContent = `${levelData.task}`;
        this.viewer.update(levelData, isGameOver);
        this.table.update(levelData, isGameOver);
    }
}
