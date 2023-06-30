import { Playground } from './components/playground/Playground';
import { Menu } from './components/menu/menu';
import { observer } from './common/observer';
import { LEVELS_LIST } from './data/levelsData';
import './css/style.css';

export const LEVELS_TOTAL = LEVELS_LIST.length;
export const DEFAULT_LEVEL = 0;

export type UpdateStateParams = {
    levelNum?: number;
    isCompleted?: boolean;
    isHintUsed?: boolean;
    isReset?: boolean;
};

export type LevelState = Pick<UpdateStateParams, 'isCompleted' | 'isHintUsed'>;

enum StorageKey {
    State = 'state',
    Level = 'level',
}

class App {
    private currLevel: number;
    private levelsState: LevelState[];
    private appRoot: HTMLElement;
    private menu: Menu;
    private playground: Playground;
    constructor(appRoot: HTMLElement) {
        this.appRoot = appRoot;
        this.currLevel = Number(localStorage.getItem(StorageKey.Level)) || DEFAULT_LEVEL;
        const storedState: string | null = localStorage.getItem(StorageKey.State);
        this.levelsState = typeof storedState === 'string' ? JSON.parse(storedState) : this.createInitialState();
        observer.subscribe(this.updateState.bind(this));
        window.addEventListener('beforeunload', () => localStorage.setItem(StorageKey.State, JSON.stringify(this.levelsState)));
        window.addEventListener('beforeunload', () => localStorage.setItem(StorageKey.Level, `${this.currLevel}`));
        this.playground = new Playground(this.appRoot, LEVELS_LIST[this.currLevel], this.currLevel);
        this.menu = new Menu(this.appRoot, this.currLevel, LEVELS_TOTAL, this.levelsState);
    }

    private updateState(params: UpdateStateParams): void {
        const { levelNum, isCompleted, isHintUsed, isReset } = params;
        if (isCompleted) {
            this.levelsState[this.currLevel].isCompleted = params.isCompleted;
        }

        if (isHintUsed) {
            this.levelsState[this.currLevel].isHintUsed = params.isHintUsed;
        }

        if (levelNum === LEVELS_TOTAL) {
            this.updateApp(true);
        } else if (levelNum !== undefined) {
            this.currLevel = levelNum;
            this.updateApp();
        }

        if (isReset) {
            this.createInitialState();
            this.updateApp();
        }
    }

    private updateApp(isOver?: boolean): void {
        this.menu.update(this.currLevel, this.levelsState);
        this.playground.update(LEVELS_LIST[this.currLevel], this.currLevel, isOver);
    }

    private createInitialState(): void {
        this.currLevel = DEFAULT_LEVEL;
        this.levelsState = LEVELS_LIST.map(() => {
            return { isCompleted: false, isHintUsed: false };
        });
    }
}

new App(document.body);
