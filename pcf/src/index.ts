import {IInputs, IOutputs} from './generated/ManifestTypes';

export class TAskGantt implements ComponentFramework.StandardControl<IInputs, IOutputs> {
    private _container: HTMLDivElement;
    private _context: ComponentFramework.Context<IInputs> | null = null;

    constructor() {}

    public init(context: ComponentFramework.Context<IInputs>, notifyOutputChanged: () => void, state: ComponentFramework.Dictionary, container:HTMLDivElement) {
        this._context = context;
        this._container = container;
        // create iframe to host the Code App
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%'; iframe.style.height = '400px'; iframe.style.border = '0';
        const url = this._context.mode.isControlDisabled ? '' : context.parameters.tasks.raw || '';
        // support passing host URL in tasks.raw for simplicity, otherwise instruct to set resource URL
        iframe.src = String(url) || '';
        container.appendChild(iframe);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): void {
        // update iframe src if changed
        const iframe = this._container.querySelector('iframe');
        if (iframe) {
            const url = context.parameters.tasks.raw || '';
            iframe.setAttribute('src', String(url));
        }
    }

    public getOutputs(): IOutputs {
        return {} as IOutputs;
    }

    public destroy(): void {
        // cleanup
    }
}
