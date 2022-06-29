import { AppContext } from '../context';

export default function FormNewEditFlow() {
  return (
    <AppContext.Consumer>{({ lang }) => <div>Test</div>}</AppContext.Consumer>
  );
}
