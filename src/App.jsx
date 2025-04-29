import { BrowserRouter as Router } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
      {/* Navbar always visible */}
      <Navbar />

      {/* All page routes */}
      <AppRoutes />

      {/* Footer always visible */}
      <Footer />
    </Router>
  );
}

export default App;
