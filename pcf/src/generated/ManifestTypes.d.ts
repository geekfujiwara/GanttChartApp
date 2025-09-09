declare namespace ComponentFramework {
    interface Context<T> { parameters: any; mode: any; }
    interface Dictionary { }
    interface StandardControl<TInputs, TOutputs> {
        init(context: Context<TInputs>, notifyOutputChanged: () => void, state: Dictionary, container: HTMLDivElement): void;
        updateView(context: Context<TInputs>): void;
        getOutputs(): TOutputs;
        destroy(): void;
    }
}

export interface IInputs { tasks: any }
export interface IOutputs { }
