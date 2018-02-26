import 'source-map-support/register'
import { h, Component, render } from 'preact';

import { AppStore, AppState, ErrorState, LoadedState, Dispatcher,
         LoadedJournalState } from './store';

interface AppProps<T> {
    state: T;
    dispatch: Dispatcher;
}

function Loading(): JSX.Element {
    return (
        <p>Please wait...</p>
    );
}

function ErrorView({ state, dispatch }: AppProps<ErrorState>): JSX.Element {
    let errInfo: JSX.Element;

    if (state.type == 'friendlyError') {
        errInfo = <p>{state.message}</p>;
    } else {
        errInfo = <p>Alas, an error occurred: {state.message}</p>;
    }

    return (
        <div>
            {errInfo}
            <button onClick={() => dispatch({ type: 'init' })}>
              Retry
            </button>
        </div>
    );
}

function Loaded({ state, dispatch }: AppProps<LoadedState>): JSX.Element {
    return (
        <ul>
          {state.saveGames.map(saveGame => (
              <li>
                  <button onClick={() => dispatch({ type: 'loadgame', saveGame })}>
                      {saveGame.name}
                  </button>
              </li>
          ))}
        </ul>
    );
}

function LoadedJournal({ state, dispatch }: AppProps<LoadedJournalState>): JSX.Element {
    return (
        <div>
            <button onClick={() => dispatch({ type: 'init' })}>Back</button>
            <p>Journal for <strong>{state.name}</strong></p>
            <button onClick={() => dispatch({ type: 'export', format: 'clipboard' })}>
              Export to clipboard
            </button>
            <pre role="log">
            {state.log.map(msg => <div>{msg}</div>)}
            </pre>
            <div>{state.journal.asJSX()}</div>
        </div>
    );
}

function App({ state, dispatch }: AppProps<AppState>): JSX.Element {
    switch (state.type) {
        case 'loading': return <Loading/>;

        case 'friendlyError':
        case 'error':
        return <ErrorView {...{ state, dispatch }} />;

        case 'loaded': return <Loaded {...{ state, dispatch }} />;
        case 'loadedjournal': return <LoadedJournal {...{ state, dispatch }} />;
    }
}

type AppWrapperState = AppProps<AppState>;

export class AppWrapper extends Component<{}, AppWrapperState> {
    store: AppStore;

    constructor(props: {}) {
        super(props);
        this.store = new AppStore((state, dispatch) => {
            this.setState({ state, dispatch });
        });
    }

    componentDidMount() {
        this.store.dispatch({ type: 'init' });
    }

    render() {
        return <App {...this.state}/>;
    }
}

export function start(root: HTMLElement) {
    render(<AppWrapper/>, root);
}
