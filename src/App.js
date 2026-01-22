import './App.css';
import Hrm from './components/Hrm';
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="App">
         <Toaster
        position="top-right"
        reverseOrder={false}
      />
      <Hrm/>
    </div>
  );
}

export default App;