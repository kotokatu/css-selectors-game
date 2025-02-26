import { BaseComponent } from '../../abstract/base-component';
import { LevelData, ItemData } from '../../../data/levelsData';
import hljs from 'highlight.js';
import xml from '../../../../node_modules/highlight.js/lib/languages/xml.js';
import './viewer.css';
hljs.registerLanguage('xml', xml);

export class Viewer extends BaseComponent {
    private viewerWindow: HTMLElement;
    public viewerItems: HTMLElement[] = [];
    onMouseOver: (e: MouseEvent) => void;
    onMouseOut: (e: MouseEvent) => void;
    private levelData: LevelData;
    constructor(
        parent: HTMLDivElement,
        levelData: LevelData,
        onMouseOver: (e: MouseEvent) => void,
        onMouseOut: (e: MouseEvent) => void
    ) {
        super({ parent, className: 'viewer pane' });
        this.levelData = levelData;
        this.onMouseOver = onMouseOver;
        this.onMouseOut = onMouseOut;
        this.viewerWindow = new BaseComponent<HTMLDivElement>({
            parent: this.element,
            className: 'viewer-window',
        }).element;

        this.render();
    }

    private render(): void {
        const paneHeader: HTMLDivElement = new BaseComponent<HTMLDivElement>({
            parent: this.element,
            className: 'pane-header',
            content: `HTML Viewer`,
        }).element;
        new BaseComponent<HTMLSpanElement>({
            tag: 'span',
            parent: paneHeader,
            className: 'filename',
            content: 'index.html',
        });
        new BaseComponent<HTMLDivElement>({
            parent: this.element,
            className: 'gutter',
            content: '1 2 3 4 5 6 7 8 9 10 11 12 13 14 15 16',
        });
        this.addItemsToViewer();
    }

    private createViewerItem(itemData: ItemData): HTMLDivElement {
        const item: HTMLDivElement = new BaseComponent<HTMLDivElement>().element;
        const code: HTMLElement = new BaseComponent({ tag: 'code', parent: item }).element;
        let content = `<${itemData.tag}`;

        if (itemData.class) {
            content += ` class="${itemData.class}"`;
        }

        if (itemData.id) {
            content += ` id="${itemData.id}"`;
        }

        if (itemData.attribute) {
            content += ` ${itemData.attribute[0]}="${itemData.attribute[1]}"`;
        }

        code.insertAdjacentHTML('afterbegin', hljs.highlight(`${content}>`, { language: 'html' }).value);

        if (itemData.children) {
            itemData.children.forEach((child: ItemData) => code.append(this.createViewerItem(child)));
        }

        code.insertAdjacentHTML('beforeend', hljs.highlight(`</${itemData.tag}>`, { language: 'html' }).value);

        item.addEventListener('mouseover', this.onMouseOver);
        item.addEventListener('mouseout', this.onMouseOut);

        this.viewerItems.push(item);
        return item;
    }

    private addItemsToViewer(): void {
        const markupWrapper: HTMLDivElement = new BaseComponent<HTMLDivElement>({ parent: this.viewerWindow }).element;
        markupWrapper.insertAdjacentHTML(
            'afterbegin',
            hljs.highlight('<div class="table">', { language: 'html' }).value
        );
        this.levelData.markup.forEach((elem: ItemData) =>
            markupWrapper.insertAdjacentElement('beforeend', this.createViewerItem(elem))
        );
        markupWrapper.insertAdjacentHTML('beforeend', hljs.highlight('</div>', { language: 'html' }).value);
    }

    public update(levelData?: LevelData, isGameOver?: boolean): void {
        if (isGameOver) {
            this.viewerWindow.classList.add('hover-disabled');
        } else {
            if (levelData) this.levelData = levelData;
            this.viewerItems = [];
            this.viewerWindow.classList.remove('hover-disabled');
            this.viewerWindow.replaceChildren();
            this.addItemsToViewer();
        }
    }
}
